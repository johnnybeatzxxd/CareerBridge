package com.jobsite.web;

import com.jobsite.data.ApplicationRepository;
import com.jobsite.data.JobAlertRepository;
import com.jobsite.data.JobRepository;
import com.jobsite.data.FinancialRepository;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class DashboardServlet extends HttpServlet {
    private final ApplicationRepository applications = new ApplicationRepository();
    private final JobRepository jobs = new JobRepository();
    private final JobAlertRepository alerts = new JobAlertRepository();
    private final FinancialRepository finances = new FinancialRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            if (Api.hasRole(request, "JOB_SEEKER")) {
                Api.json(response, HttpServletResponse.SC_OK, Map.of(
                        "applications", applications.countForSeeker(Api.userId(request)),
                        "jobAlerts", alerts.countForSeeker(Api.userId(request)),
                        "balance", finances.wallet(Api.userId(request)).availableBalance
                ));
            } else if (Api.hasRole(request, "EMPLOYER")) {
                Api.json(response, HttpServletResponse.SC_OK, Map.of(
                        "jobs", jobs.search(null, null, null, Api.userId(request)).size(),
                        "applications", applications.countForEmployer(Api.userId(request))
                ));
            } else {
                Api.json(response, HttpServletResponse.SC_OK, Map.of("message", "Admin dashboard"));
            }
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load dashboard");
        }
    }
}
