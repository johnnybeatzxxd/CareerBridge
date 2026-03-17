package com.jobsite.web;

import com.jobsite.data.JobRepository;
import com.jobsite.data.SystemRepository;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class PublicServlet extends HttpServlet {
    private final JobRepository jobs = new JobRepository();
    private final SystemRepository system = new SystemRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!"/landing".equals(Api.path(request))) {
            Api.error(response, HttpServletResponse.SC_NOT_FOUND, "Unknown public route");
            return;
        }
        try {
            Api.json(response, HttpServletResponse.SC_OK, Map.of(
                    "stats", system.stats(),
                    "featuredJobs", jobs.search(null, null, null, null).stream().limit(6).toList()
            ));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load landing data");
        }
    }
}
