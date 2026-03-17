package com.jobsite.web;

import com.jobsite.data.CvRepository;
import com.jobsite.data.UserRepository;
import com.jobsite.model.CvProfile;
import com.jobsite.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.SQLException;
import java.util.Map;

@MultipartConfig
public class CvServlet extends HttpServlet {
    private final CvRepository cvs = new CvRepository();
    private final UserRepository users = new UserRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            if ("/templates".equals(Api.path(request))) {
                Api.json(response, HttpServletResponse.SC_OK, cvs.templates());
                return;
            }
            if ("/download".equals(Api.path(request))) {
                download(request, response);
                return;
            }
            CvProfile cv = cvs.find(Api.userId(request)).orElse(new CvProfile());
            Api.json(response, HttpServletResponse.SC_OK, cv);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load CV");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            Api.json(response, HttpServletResponse.SC_OK, cvs.save(Api.userId(request), Api.read(request, CvProfile.class)));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to save CV");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        if (!"/upload".equals(Api.path(request))) {
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown CV route");
            return;
        }
        Part file = request.getPart("cv");
        String submitted = Path.of(file.getSubmittedFileName()).getFileName().toString();
        Path directory = Path.of("uploads", "cv", String.valueOf(Api.userId(request)));
        Files.createDirectories(directory);
        Path target = directory.resolve(submitted);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        try {
            cvs.attachFile(Api.userId(request), submitted, target.toString());
            Api.json(response, HttpServletResponse.SC_OK, Map.of("fileName", submitted));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to attach CV");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            cvs.delete(Api.userId(request));
            Api.json(response, HttpServletResponse.SC_OK, Map.of("deleted", true));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, "Unable to delete CV");
        }
    }

    private void download(HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException {
        User user = users.findById(Api.userId(request)).orElseThrow();
        CvProfile cv = cvs.find(Api.userId(request)).orElse(new CvProfile());
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"cv-" + user.id + ".txt\"");
        response.getWriter().write("""
                %s
                %s

                Summary
                %s

                Skills
                %s

                Experience
                %s

                Education
                %s
                """.formatted(
                safe(user.name),
                safe(cv.headline),
                safe(cv.summary),
                safe(cv.skills),
                safe(cv.experience),
                safe(cv.education)
        ));
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
