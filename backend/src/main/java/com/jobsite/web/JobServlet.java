package com.jobsite.web;

import com.jobsite.data.JobRepository;
import com.jobsite.model.Job;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class JobServlet extends HttpServlet {
    private final JobRepository jobs = new JobRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            Long employerId = "EMPLOYER".equals(request.getParameter("scope")) && Api.hasRole(request, "EMPLOYER")
                    ? Api.userId(request)
                    : null;
            String path = Api.path(request);
            if (path.matches("/\\d+")) {
                long id = Long.parseLong(path.substring(1));
                jobs.findById(id).ifPresentOrElse(job -> {
                    boolean owner = Api.hasRole(request, "EMPLOYER") && job.employerId == Api.userId(request);
                    if (owner || ("OPEN".equals(job.status) && !job.filled)) {
                        write(response, job);
                    } else {
                        notFound(response);
                    }
                }, () -> notFound(response));
                return;
            }
            Api.json(response, HttpServletResponse.SC_OK, jobs.search(
                    request.getParameter("q"),
                    request.getParameter("location"),
                    request.getParameter("jobType"),
                    employerId
            ));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load jobs");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        try {
            Job body = Api.read(request, Job.class);
            if (body.price == null || body.price.signum() <= 0) {
                Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Job price must be greater than zero");
                return;
            }
            body.salary = null;
            Job job = jobs.create(Api.userId(request), body);
            Api.json(response, HttpServletResponse.SC_CREATED, job);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to create job");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        try {
            long id = Long.parseLong(Api.path(request).substring(1));
            Job body = Api.read(request, Job.class);
            if (body.price == null || body.price.signum() <= 0) {
                Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Job price must be greater than zero");
                return;
            }
            body.salary = null;
            jobs.update(id, Api.userId(request), body);
            Api.json(response, HttpServletResponse.SC_OK, Map.of("updated", true));
        } catch (Exception exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to update job");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        try {
            long id = Long.parseLong(Api.path(request).substring(1));
            jobs.delete(id, Api.userId(request));
            Api.json(response, HttpServletResponse.SC_OK, Map.of("deleted", true));
        } catch (Exception exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to delete job");
        }
    }

    private void write(HttpServletResponse response, Job job) {
        try {
            Api.json(response, HttpServletResponse.SC_OK, job);
        } catch (IOException exception) {
            throw new RuntimeException(exception);
        }
    }

    private void notFound(HttpServletResponse response) {
        try {
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Job not found");
        } catch (IOException exception) {
            throw new RuntimeException(exception);
        }
    }
}
