package com.sociomantra.backend.service;

import com.sociomantra.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Verifies Google "Sign in with Google" ID tokens by asking Google's own
 * tokeninfo endpoint to validate the signature and return its claims. This
 * is simpler and has fewer moving parts than verifying the JWT signature
 * locally against Google's rotating public keys, at the cost of an extra
 * network round-trip per login and Google's documented rate limit on that
 * endpoint. Fine at this site's scale; if login volume ever gets large,
 * switch to local verification via
 * com.google.api-client:google-api-client (GoogleIdTokenVerifier) instead.
 */
@Service
public class GoogleTokenVerifier {

    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.oauth.google.client-id:}")
    private String expectedClientId;

    public record GoogleUser(String email, String name) {
    }

    public GoogleUser verify(String idToken) {
        if (expectedClientId == null || expectedClientId.isBlank()) {
            throw new ApiException("Google sign-in is not configured on this server.", HttpStatus.SERVICE_UNAVAILABLE);
        }
        if (idToken == null || idToken.isBlank()) {
            throw new ApiException("Missing Google ID token.", HttpStatus.BAD_REQUEST);
        }

        Map<?, ?> claims;
        try {
            claims = restTemplate.getForObject(TOKENINFO_URL + idToken, Map.class);
        } catch (RestClientException e) {
            throw new ApiException("Could not verify Google sign-in. Please try again.", HttpStatus.UNAUTHORIZED);
        }

        if (claims == null) {
            throw new ApiException("Invalid Google sign-in token.", HttpStatus.UNAUTHORIZED);
        }

        String audience = String.valueOf(claims.get("aud"));
        if (!expectedClientId.equals(audience)) {
            throw new ApiException("This Google sign-in token was not issued for this app.", HttpStatus.UNAUTHORIZED);
        }

        boolean emailVerified = "true".equals(String.valueOf(claims.get("email_verified")));
        if (!emailVerified) {
            throw new ApiException("Your Google account's email is not verified.", HttpStatus.UNAUTHORIZED);
        }

        String email = (String) claims.get("email");
        Object nameClaim = claims.get("name");
        String name = (nameClaim != null) ? nameClaim.toString() : email;

        if (email == null || email.isBlank()) {
            throw new ApiException("Google did not return an email address.", HttpStatus.UNAUTHORIZED);
        }

        return new GoogleUser(email, name);
    }
}
