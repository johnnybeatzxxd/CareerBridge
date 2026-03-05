package com.jobsite.web;

import com.jobsite.data.ApplicationRepository;
import com.jobsite.model.Application;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class ApplicationServlet extends HttpServlet {
    private final ApplicationRepository applications = new ApplicationRepository();

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
        try {
            if (Api.hasRole(request, "JOB_SEEKER")) {
                Api.json(response, HttpServletResponse.SC_OK, applications.findForSeeker(Api.userId(request)));
            } else if (Api.hasRole(request, "EMPLOYER")) {
                Api.json(response, HttpServletResponse.SC_OK, applications.findForEmployer(Api.userId(request)));
            } else {
                Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Applications are available to job seekers and employers");
            }
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load applications");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            ApplyRequest body = Api.read(request, ApplyRequest.class);
            Application application = applications.create(body.jobId, Api.userId(request), body.coverLetter);
            Api.json(response, HttpServletResponse.SC_CREATED, application);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to submit application");
        }
    }

    private void patch(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        try {
            StatusRequest body = Api.read(request, StatusRequest.class);
            long id = Long.parseLong(Api.path(request).substring(1));
            applications.updateStatus(id, Api.userId(request), body.status);
            Api.json(response, HttpServletResponse.SC_OK, Map.of("updated", true));
        } catch (Exception exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to update application");
        }
    }

    static class ApplyRequest {
        long jobId;
        String coverLetter;
    }

    static class StatusRequest {
        String status;
    }
}
