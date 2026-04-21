package com.jobsite.web;

import com.jobsite.data.ApplicationRepository;
import com.jobsite.model.Application;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
            String path = Api.path(request);
            if (path.matches("/\\d+/profile")) {
                candidateProfile(request, response, idFrom(path));
                return;
            }
            if (path.matches("/\\d+/resume-file")) {
                candidateResumeFile(request, response, idFrom(path));
                return;
            }
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

    private void candidateProfile(HttpServletRequest request, HttpServletResponse response, long applicationId)
            throws IOException, SQLException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        applications.findCandidateProfile(applicationId, Api.userId(request))
                .ifPresentOrElse(profile -> {
                    try {
                        Api.json(response, HttpServletResponse.SC_OK, profile);
                    } catch (IOException exception) {
                        throw new RuntimeException(exception);
                    }
                }, () -> {
                    try {
                        Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Candidate profile not found");
                    } catch (IOException exception) {
                        throw new RuntimeException(exception);
                    }
                });
    }

    private void candidateResumeFile(HttpServletRequest request, HttpServletResponse response, long applicationId)
            throws IOException, SQLException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        var cv = applications.findCandidateResumeFile(applicationId, Api.userId(request));
        if (cv.isEmpty()) {
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Uploaded resume not found");
            return;
        }
        Path file = Path.of(cv.get().filePath);
        if (!Files.isRegularFile(file)) {
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Uploaded resume file is unavailable");
            return;
        }
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(Files.probeContentType(file) == null ? "application/octet-stream" : Files.probeContentType(file));
        response.setHeader("Content-Disposition", "attachment; filename=\"" + safeFileName(cv.get().fileName) + "\"");
        Files.copy(file, response.getOutputStream());
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

    private long idFrom(String path) {
        return Long.parseLong(path.split("/")[1]);
    }

    private String safeFileName(String value) {
        return value == null ? "resume" : value.replace("\"", "").replace("\r", "").replace("\n", "");
    }
}
