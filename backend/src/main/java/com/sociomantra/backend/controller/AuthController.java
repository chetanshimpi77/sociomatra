package com.sociomantra.backend.controller;

import com.sociomantra.backend.dto.auth.AuthDtos.AuthResponse;
import com.sociomantra.backend.dto.auth.AuthDtos.ChangePasswordRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.ForgotPasswordRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.GoogleLoginRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.LoginRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.RegisterRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.ResetPasswordRequest;
import com.sociomantra.backend.exception.ApiException;
import com.sociomantra.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/student/register")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    @PostMapping("/student/login")
    public ResponseEntity<AuthResponse> loginStudent(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginStudent(request));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginAdmin(request));
    }

    // Public - "Continue with Google" on the student sign in/sign up pages.
    @PostMapping("/student/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.getIdToken()));
    }

    // Requires a valid JWT (see SecurityConfig) - the signed-in user changes their own password.
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = currentUserEmail();
        authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    // Public - step 1 of the reset flow.
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    // Public - step 2 of the reset flow, using the token from step 1.
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now sign in."));
    }

    private String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ApiException("Please sign in to change your password.", HttpStatus.UNAUTHORIZED);
        }
        return auth.getName();
    }
}
