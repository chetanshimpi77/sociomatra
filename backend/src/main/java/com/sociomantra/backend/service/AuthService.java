package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.auth.AuthDtos.AuthResponse;
import com.sociomantra.backend.dto.auth.AuthDtos.LoginRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.RegisterRequest;
import com.sociomantra.backend.entity.PasswordResetToken;
import com.sociomantra.backend.entity.Role;
import com.sociomantra.backend.entity.User;
import com.sociomantra.backend.exception.ApiException;
import com.sociomantra.backend.repository.PasswordResetTokenRepository;
import com.sociomantra.backend.repository.UserRepository;
import com.sociomantra.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Value("${app.password-reset.expiry-minutes}")
    private int resetTokenExpiryMinutes;

    @Value("${app.password-reset.expose-token-in-response:true}")
    private boolean exposeResetTokenInResponse;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists.", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name(), token);
    }

    public AuthResponse loginStudent(LoginRequest request) {
        return login(request, Role.STUDENT);
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        return login(request, Role.ADMIN);
    }

    /**
     * "Continue with Google" for students. Verifies the ID token, then
     * either signs in an existing account matched by email or creates a new
     * STUDENT account on the fly (password set to a random value the user
     * never sees/needs - they can set a real one later via "change
     * password" or a normal forgot-password reset if they ever want to also
     * sign in without Google).
     */
    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(idToken);

        User user = userRepository.findByEmail(googleUser.email()).orElseGet(() -> {
            User created = User.builder()
                    .name(googleUser.name())
                    .email(googleUser.email())
                    .phone("")
                    .password(passwordEncoder.encode(generateRawToken()))
                    .role(Role.STUDENT)
                    .build();
            return userRepository.save(created);
        });

        if (user.getRole() != Role.STUDENT) {
            throw new ApiException("This email is registered as an admin account.", HttpStatus.CONFLICT);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), token);
    }

    private AuthResponse login(LoginRequest request, Role expectedRole) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED));

        if (user.getRole() != expectedRole) {
            throw new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), token);
    }

    /**
     * Changes the password for the currently authenticated user. Requires
     * the current password so a stolen/short-lived session token alone
     * can't be used to lock the real owner out of their account.
     */
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ApiException("Current password is incorrect.", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Generates a one-time reset token for the given email, if an account
     * exists. Always returns normally (never reveals whether the email is
     * registered) to avoid leaking account existence.
     *
     * If SMTP is configured (app.mail.enabled=true, see EmailService), the
     * reset link is actually emailed and the response never contains the
     * token. Otherwise it falls back to dev-mode behavior: the raw token is
     * returned directly in the response when
     * app.password-reset.expose-token-in-response=true, so the flow is still
     * usable end-to-end without an email provider during development.
     *
     * There's no SMS option: sending SMS requires a paid provider account
     * (e.g. Twilio) that this project can't set up on your behalf. See
     * backend/README.md if you want to add it later - it's a small addition
     * alongside EmailService following the same pattern.
     */
    @Transactional
    public Map<String, Object> forgotPassword(String email) {
        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Same response either way - don't leak which emails are registered.
            return Map.of("message", "If an account exists for that email, a reset link has been sent.");
        }

        String rawToken = generateRawToken();
        String tokenHash = hash(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(userOpt.get())
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(resetTokenExpiryMinutes))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        if (emailService.isEnabled()) {
            String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
            boolean sent = emailService.sendPasswordResetEmail(userOpt.get().getEmail(), resetLink);
            if (sent) {
                return Map.of("message", "If an account exists for that email, a reset link has been sent.");
            }
            log.error("Password reset email failed to send for {}", email);
        }

        if (exposeResetTokenInResponse) {
            return Map.of(
                    "message", "Reset token generated (dev mode - no email provider configured; normally this would be emailed to the user).",
                    "resetToken", rawToken,
                    "expiresInMinutes", resetTokenExpiryMinutes
            );
        }

        return Map.of("message", "If an account exists for that email, a reset link has been sent.");
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String tokenHash = hash(rawToken);

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException("Invalid or expired reset token.", HttpStatus.BAD_REQUEST));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Invalid or expired reset token.", HttpStatus.BAD_REQUEST);
        }

        // Atomically claim the token before touching the password. If a
        // concurrent request already claimed it in the moment between the
        // check above and this call, claimIfUnused returns 0 and we bail
        // out instead of resetting the password twice.
        int claimed = passwordResetTokenRepository.claimIfUnused(resetToken.getId());
        if (claimed == 0) {
            throw new ApiException("This reset token has already been used.", HttpStatus.BAD_REQUEST);
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new ApiException("Unable to process request.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
