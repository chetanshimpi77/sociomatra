package com.sociomantra.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Lightweight, dependency-free rate limiter suitable for a single backend
 * instance. Each client IP gets a fixed number of requests per rolling
 * window against the sensitive endpoints below. For a multi-instance
 * deployment, replace this with a shared store (e.g. Redis + Bucket4j).
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> LIMITED_PREFIXES = Set.of(
            "/api/auth/",
            "/api/enquiries"
    );

    @Value("${app.rate-limit.capacity}")
    private int capacity;

    @Value("${app.rate-limit.window-seconds}")
    private int windowSeconds;

    private final ConcurrentHashMap<String, Window> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean limited = LIMITED_PREFIXES.stream().anyMatch(path::startsWith);

        // Only rate-limit the public write actions, not admin GETs against /api/enquiries.
        if (limited && isPublicSensitiveRequest(request)) {
            String key = clientIp(request) + ":" + path;
            Window window = counters.computeIfAbsent(key, k -> new Window(System.currentTimeMillis()));

            long now = System.currentTimeMillis();
            long windowMs = windowSeconds * 1000L;

            synchronized (window) {
                if (now - window.startedAt > windowMs) {
                    window.startedAt = now;
                    window.count.set(0);
                }
                if (window.count.incrementAndGet() > capacity) {
                    response.setStatus(429);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests - please try again in a minute.\"}"
                    );
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicSensitiveRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/")) return true;
        // Only the public "create enquiry" POST is rate-limited, not the admin list/patch endpoints.
        return path.equals("/api/enquiries") && "POST".equalsIgnoreCase(method);
    }

    /**
     * Without this, every distinct IP+path combination that ever hits a
     * limited endpoint leaves a permanent entry in `counters` - on a busy
     * public site (many unique visitor IPs submitting enquiries) that's an
     * unbounded, slow memory leak over the app's uptime. Runs every 10
     * minutes and drops any window that's been idle for 3x the configured
     * rate-limit window - long enough that it's definitely done limiting
     * anything, short enough to keep the map small.
     */
    @Scheduled(fixedDelay = 10 * 60 * 1000)
    void evictStaleWindows() {
        long cutoff = System.currentTimeMillis() - (windowSeconds * 1000L * 3);
        counters.entrySet().removeIf(entry -> entry.getValue().startedAt < cutoff);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class Window {
        volatile long startedAt;
        final AtomicInteger count = new AtomicInteger(0);

        Window(long startedAt) {
            this.startedAt = startedAt;
        }
    }
}
