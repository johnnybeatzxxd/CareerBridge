package com.jobsite.web;

import com.jobsite.data.JobAlertRepository;
import com.jobsite.model.JobAlert;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class JobAlertServlet extends HttpServlet {
    private final JobAlertRepository alerts = new JobAlertRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            Api.json(response, HttpServletResponse.SC_OK, alerts.findForSeeker(Api.userId(request)));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load job alerts");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            JobAlert alert = alerts.create(Api.userId(request), Api.read(request, JobAlert.class));
            Api.json(response, HttpServletResponse.SC_CREATED, alert);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to create job alert");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            alerts.update(idFrom(request), Api.userId(request), Api.read(request, JobAlert.class));
            Api.json(response, HttpServletResponse.SC_OK, Map.of("updated", true));
        } catch (Exception exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to update job alert");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            alerts.delete(idFrom(request), Api.userId(request));
            Api.json(response, HttpServletResponse.SC_OK, Map.of("deleted", true));
        } catch (Exception exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to delete job alert");
        }
    }

    private long idFrom(HttpServletRequest request) {
        return Long.parseLong(Api.path(request).substring(1));
    }
}
