package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.auth.AuthDtos.AuthResponse;
import com.sociomantra.backend.dto.auth.AuthDtos.LoginRequest;
import com.sociomantra.backend.dto.auth.AuthDtos.RegisterRequest;
import com.sociomantra.backend.entity.Role;
import com.sociomantra.backend.entity.User;
import com.sociomantra.backend.exception.ApiException;
import com.sociomantra.backend.repository.PasswordResetTokenRepository;
import com.sociomantra.backend.repository.UserRepository;
import com.sociomantra.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordResetTokenRepository, passwordEncoder, jwtUtil, emailService, googleTokenVerifier);
        ReflectionTestUtils.setField(authService, "resetTokenExpiryMinutes", 30);
        ReflectionTestUtils.setField(authService, "exposeResetTokenInResponse", true);
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:5173");
    }

    @Test
    void registerStudent_createsUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rahul Sharma");
        request.setEmail("rahul@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");

        when(userRepository.existsByEmail("rahul@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken(anyString(), anyString(), any())).thenReturn("mock-jwt");

        AuthResponse response = authService.registerStudent(request);

        assertThat(response.getEmail()).isEqualTo("rahul@example.com");
        assertThat(response.getRole()).isEqualTo("STUDENT");
        assertThat(response.getToken()).isEqualTo("mock-jwt");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerStudent_rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rahul Sharma");
        request.setEmail("rahul@example.com");
        request.setPhone("9876543210");
        request.setPassword("password123");

        when(userRepository.existsByEmail("rahul@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerStudent(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void loginStudent_rejectsAdminAccountOnStudentLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("admin123");

        User adminUser = User.builder()
                .id(1L)
                .name("Admin")
                .email("admin@example.com")
                .password("hashed")
                .role(Role.ADMIN)
                .build();

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> authService.loginStudent(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void loginStudent_rejectsWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("student@example.com");
        request.setPassword("wrong-password");

        User student = User.builder()
                .id(2L)
                .name("Student")
                .email("student@example.com")
                .password("hashed-correct-password")
                .role(Role.STUDENT)
                .build();

        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(passwordEncoder.matches("wrong-password", "hashed-correct-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.loginStudent(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void changePassword_rejectsIncorrectCurrentPassword() {
        User user = User.builder()
                .id(3L)
                .email("student@example.com")
                .password("hashed-current")
                .role(Role.STUDENT)
                .build();

        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-current", "hashed-current")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword("student@example.com", "wrong-current", "newpass123"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Current password is incorrect");

        verify(userRepository, never()).save(any());
    }

    @Test
    void forgotPassword_doesNotRevealWhetherEmailExists() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        var result = authService.forgotPassword("unknown@example.com");

        assertThat(result).containsKey("message");
        verify(passwordResetTokenRepository, never()).save(any());
    }
}
