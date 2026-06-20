package com.jobsite.web;

import com.jobsite.data.UserRepository;
import com.jobsite.data.VerificationRepository;
import com.jobsite.model.User;
import com.jobsite.security.Jwt;
import com.jobsite.security.Otp;
import com.jobsite.service.EmailService;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.time.Instant;
import java.util.Map;

public class AuthServlet extends HttpServlet {
    private final UserRepository users = new UserRepository();
    private final VerificationRepository verifications = new VerificationRepository();
    private final EmailService emailService = new EmailService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            switch (Api.path(request)) {
                case "/register" -> register(request, response);
                case "/verify-email" -> verifyEmail(request, response);
                case "/resend-otp" -> resendOtp(request, response);
                case "/login" -> login(request, response);
                case "/logout" -> Api.json(response, HttpServletResponse.SC_OK, Map.of("loggedOut", true));
                default -> Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown auth route");
            }
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            Api.error(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE, exception.getMessage());
        }
    }

    private void register(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        RegisterRequest body = Api.read(request, RegisterRequest.class);
        if (blank(body.name) || blank(body.email) || blank(body.password) || blank(body.role)) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Name, email, password and role are required");
            return;
        }
        if (!body.role.equals("JOB_SEEKER") && !body.role.equals("EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid role");
            return;
        }
        if (users.emailExists(body.email)) {
            Api.error(response, HttpServletResponse.SC_CONFLICT, "An account already exists with this email");
            return;
        }
        if ("EMPLOYER".equals(body.role) && (blank(body.companyName) || blank(body.companyEmail))) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Company name and company email are required");
            return;
        }
        String email = body.email.trim().toLowerCase();
        String code = Otp.generate();
        Instant now = Instant.now();
        verifications.save(
                body.name.trim(),
                email,
                body.password,
                body.role,
                body.companyName == null ? null : body.companyName.trim(),
                body.companyEmail == null ? null : body.companyEmail.trim(),
                Otp.hash(email, code),
                now.plusSeconds(600),
                now.plusSeconds(60)
        );
        emailService.sendVerificationCode(email, body.name.trim(), code);
        Api.json(response, HttpServletResponse.SC_ACCEPTED, Map.of(
                "verificationRequired", true,
                "email", email,
                "expiresInSeconds", 600
        ));
    }

    private void verifyEmail(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        VerificationRequest body = Api.read(request, VerificationRequest.class);
        if (blank(body.email) || blank(body.code) || !body.code.matches("\\d{6}")) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Email and a six-digit code are required");
            return;
        }
        User user = verifications.verify(body.email.trim(), Otp.hash(body.email.trim(), body.code));
        Api.json(response, HttpServletResponse.SC_CREATED, authPayload(user));
    }

    private void resendOtp(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        EmailRequest body = Api.read(request, EmailRequest.class);
        if (blank(body.email)) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Email is required");
            return;
        }
        var pending = verifications.findForResend(body.email.trim())
                .orElseThrow(() -> new SQLException("No pending verification was found"));
        String code = Otp.generate();
        Instant now = Instant.now();
        verifications.updateCode(pending.email, Otp.hash(pending.email, code), now.plusSeconds(600), now.plusSeconds(60));
        emailService.sendVerificationCode(pending.email, pending.name, code);
        Api.json(response, HttpServletResponse.SC_OK, Map.of("resent", true, "expiresInSeconds", 600));
    }

    private void login(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        LoginRequest body = Api.read(request, LoginRequest.class);
        users.authenticate(body.email, body.password)
                .ifPresentOrElse(user -> {
                    try {
                        Api.json(response, HttpServletResponse.SC_OK, authPayload(user));
                    } catch (IOException exception) {
                        throw new RuntimeException(exception);
                    }
                }, () -> {
                    try {
                        Api.error(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid email or password");
                    } catch (IOException exception) {
                        throw new RuntimeException(exception);
                    }
                });
    }

    private Map<String, Object> authPayload(User user) {
        return Map.of("token", Jwt.issue(user), "user", user);
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    static class RegisterRequest {
        String name;
        String email;
        String password;
        String role;
        String companyName;
        String companyEmail;
    }

    static class LoginRequest {
        String email;
        String password;
    }

    static class VerificationRequest {
        String email;
        String code;
    }

    static class EmailRequest {
        String email;
    }
}
