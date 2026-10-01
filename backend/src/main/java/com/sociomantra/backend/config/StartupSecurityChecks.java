package com.sociomantra.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Component
public class StartupSecurityChecks {

    private static final String DEFAULT_JWT_SECRET =
            "sociomantra-ias-academy-super-secret-key-change-me-in-production-please";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.password-reset.expose-token-in-response:true}")
    private boolean exposeResetToken;

    private final Environment environment;

    public StartupSecurityChecks(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void checkOnStartup() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (DEFAULT_JWT_SECRET.equals(jwtSecret)) {
            if (isProd) {
                log.error("==============================================================");
                log.error("REFUSING TO START: app.jwt.secret is still the default dev value.");
                log.error("Set the JWT_SECRET environment variable to a long, random string");
                log.error("before running with the 'prod' profile. See backend/README.md.");
                log.error("==============================================================");
                throw new IllegalStateException(
                        "JWT_SECRET must be changed before running with the 'prod' profile.");
            }
            log.warn("Using the default development JWT secret. This is fine for local dev, " +
                    "but MUST be changed via the JWT_SECRET environment variable before deploying.");
        }

        if (isProd && exposeResetToken) {
            log.warn("==============================================================");
            log.warn("app.password-reset.expose-token-in-response is TRUE while running");
            log.warn("with the 'prod' profile. Password reset tokens will be returned");
            log.warn("directly in API responses instead of emailed. Set EXPOSE_RESET_TOKEN=false");
            log.warn("unless you have intentionally overridden this. See backend/README.md.");
            log.warn("==============================================================");
        }
    }
}
