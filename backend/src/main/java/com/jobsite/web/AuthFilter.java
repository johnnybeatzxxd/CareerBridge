package com.jobsite.web;

import com.jobsite.security.Jwt;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

public class AuthFilter implements Filter {
    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/health",
            "/api/public/landing",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/logout"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String uri = httpRequest.getRequestURI();
        if ("GET".equalsIgnoreCase(httpRequest.getMethod()) && uri.startsWith("/api/jobs")) {
            applyOptionalAuthentication(httpRequest);
            chain.doFilter(request, response);
            return;
        }
        if (isPublic(httpRequest, uri)) {
            chain.doFilter(request, response);
            return;
        }
        String header = httpRequest.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            Api.error(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }
        try {
            Map<String, Object> claims = Jwt.verify(header.substring("Bearer ".length()));
            httpRequest.setAttribute("userId", ((Number) claims.get("sub")).longValue());
            httpRequest.setAttribute("role", claims.get("role").toString());
            chain.doFilter(request, response);
        } catch (IllegalArgumentException exception) {
            Api.error(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
        }
    }

    private boolean isPublic(HttpServletRequest request, String uri) {
        return PUBLIC_PATHS.contains(uri);
    }

    private void applyOptionalAuthentication(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return;
        }
        try {
            Map<String, Object> claims = Jwt.verify(header.substring("Bearer ".length()));
            request.setAttribute("userId", ((Number) claims.get("sub")).longValue());
            request.setAttribute("role", claims.get("role").toString());
        } catch (IllegalArgumentException ignored) {
            // Public job browsing still works when an optional token is invalid.
        }
    }
}
