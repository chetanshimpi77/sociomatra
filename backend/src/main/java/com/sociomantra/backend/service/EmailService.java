package com.sociomantra.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isEnabled() {
        return mailEnabled;
    }

    /**
     * Sends the password reset link by email. Returns true if the email was
     * (attempted to be) sent, false if mail isn't configured, so the caller
     * can fall back to the dev-mode "show the token on screen" behavior.
     */
    public boolean sendPasswordResetEmail(String toEmail, String resetLink) {
        if (!mailEnabled) return false;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Reset your SocioMantra IAS Academy password");
            message.setText(
                    "We received a request to reset your password.\n\n" +
                    "Click the link below to choose a new password (valid for a limited time):\n" +
                    resetLink + "\n\n" +
                    "If you didn't request this, you can safely ignore this email."
            );
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
