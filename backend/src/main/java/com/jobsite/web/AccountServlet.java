package com.jobsite.web;

import com.jobsite.data.UserRepository;
import com.jobsite.model.User;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

public class AccountServlet extends HttpServlet {
    private final UserRepository users = new UserRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            users.findById(Api.userId(request))
                    .ifPresentOrElse(user -> write(response, user), () -> notFound(response));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load account");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            User body = Api.read(request, User.class);
            User current = users.findById(Api.userId(request)).orElseThrow();
            if (blank(body.name) || blank(body.email)) {
                Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Name and email are required");
                return;
            }
            if ("EMPLOYER".equals(current.role) && (blank(body.companyName) || blank(body.companyEmail))) {
                Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Company name and company email are required");
                return;
            }
            User user = users.update(
                    Api.userId(request),
                    body.name.trim(),
                    body.email.trim(),
                    null,
                    body.companyName == null ? null : body.companyName.trim(),
                    body.companyEmail == null ? null : body.companyEmail.trim(),
                    null,
                    null
            );
            Api.json(response, HttpServletResponse.SC_OK, user);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to update account");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            users.setActive(Api.userId(request), false);
            Api.json(response, HttpServletResponse.SC_OK, java.util.Map.of("deleted", true));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to delete account");
        }
    }

    private void write(HttpServletResponse response, User user) {
        try {
            Api.json(response, HttpServletResponse.SC_OK, user);
        } catch (IOException exception) {
            throw new RuntimeException(exception);
        }
    }

    private void notFound(HttpServletResponse response) {
        try {
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Account not found");
        } catch (IOException exception) {
            throw new RuntimeException(exception);
        }
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
