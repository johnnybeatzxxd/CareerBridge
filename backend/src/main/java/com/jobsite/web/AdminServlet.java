package com.jobsite.web;

import com.jobsite.data.CvRepository;
import com.jobsite.data.SystemRepository;
import com.jobsite.data.UserRepository;
import com.jobsite.model.User;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class AdminServlet extends HttpServlet {
    private final UserRepository users = new UserRepository();
    private final CvRepository cvs = new CvRepository();
    private final SystemRepository system = new SystemRepository();

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws IOException, jakarta.servlet.ServletException {
        if ("PATCH".equalsIgnoreCase(request.getMethod())) {
            patch(request, response);
            return;
        }
        super.service(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "ADMIN")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Admin account required");
            return;
        }
        try {
            switch (Api.path(request)) {
                case "/stats" -> Api.json(response, HttpServletResponse.SC_OK, system.stats());
                case "/users" -> Api.json(response, HttpServletResponse.SC_OK, users.all());
                case "/cv-templates" -> Api.json(response, HttpServletResponse.SC_OK, cvs.templates());
                default -> Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown admin route");
            }
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load admin data");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "ADMIN")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Admin account required");
            return;
        }
        try {
            switch (Api.path(request)) {
                case "/users" -> {
                    UserRequest body = Api.read(request, UserRequest.class);
                    User user = users.create(body.name, body.email, body.password, body.role, body.companyName, body.companyEmail);
                    if (body.approved != null || body.active != null) {
                        user = users.update(user.id, null, null, null, null, null, body.approved, body.active);
                    }
                    Api.json(response, HttpServletResponse.SC_CREATED, user);
                }
                case "/cv-templates" -> {
                    TemplateRequest body = Api.read(request, TemplateRequest.class);
                    cvs.saveTemplate(body.name, body.body);
                    Api.json(response, HttpServletResponse.SC_CREATED, Map.of("created", true));
                }
                default -> Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown admin route");
            }
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to save admin data");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "ADMIN")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Admin account required");
            return;
        }
        try {
            String path = Api.path(request);
            if (path.matches("/users/\\d+")) {
                UserRequest body = Api.read(request, UserRequest.class);
                User user = users.update(idFrom(path), body.name, body.email, body.role, body.companyName, body.companyEmail, body.approved, body.active);
                Api.json(response, HttpServletResponse.SC_OK, user);
                return;
            }
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown admin route");
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to update user");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "ADMIN")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Admin account required");
            return;
        }
        try {
            String path = Api.path(request);
            if (path.matches("/users/\\d+")) {
                users.delete(idFrom(path));
                Api.json(response, HttpServletResponse.SC_OK, Map.of("deleted", true));
                return;
            }
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown admin route");
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to delete user");
        }
    }

    private void patch(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "ADMIN")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Admin account required");
            return;
        }
        try {
            String path = Api.path(request);
            if (path.matches("/users/\\d+/approve")) {
                users.approveEmployer(idFrom(path));
                Api.json(response, HttpServletResponse.SC_OK, Map.of("approved", true));
                return;
            }
            if (path.matches("/users/\\d+/active")) {
                ActiveRequest body = Api.read(request, ActiveRequest.class);
                users.setActive(idFrom(path), body.active);
                Api.json(response, HttpServletResponse.SC_OK, Map.of("updated", true));
                return;
            }
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown admin route");
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to update user");
        }
    }

    private long idFrom(String path) {
        return Long.parseLong(path.split("/")[2]);
    }

    static class TemplateRequest {
        String name;
        String body;
    }

    static class UserRequest {
        String name;
        String email;
        String password;
        String role;
        String companyName;
        String companyEmail;
        Boolean approved;
        Boolean active;
    }

    static class ActiveRequest {
        boolean active;
    }
}
