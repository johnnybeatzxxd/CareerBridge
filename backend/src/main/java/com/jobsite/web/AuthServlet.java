package com.jobsite.web;

import com.jobsite.data.UserRepository;
import com.jobsite.model.User;
import com.jobsite.security.Jwt;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class AuthServlet extends HttpServlet {
    private final UserRepository users = new UserRepository();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            switch (Api.path(request)) {
                case "/register" -> register(request, response);
                case "/login" -> login(request, response);
                case "/logout" -> Api.json(response, HttpServletResponse.SC_OK, Map.of("loggedOut", true));
                default -> Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown auth route");
            }
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to process auth request");
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
        User user = users.create(body.name, body.email, body.password, body.role, body.companyName, body.companyEmail);
        Api.json(response, HttpServletResponse.SC_CREATED, authPayload(user));
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
}
