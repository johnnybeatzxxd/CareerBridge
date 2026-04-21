package com.jobsite.web;

import com.jobsite.data.FinancialRepository;
import com.jobsite.model.FinancialTransaction;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

public class PaymentServlet extends HttpServlet {
    private final FinancialRepository finances = new FinancialRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        try {
            Api.json(response, HttpServletResponse.SC_OK, finances.findForEmployer(Api.userId(request)));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load payments");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "EMPLOYER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Employer account required");
            return;
        }
        try {
            PaymentRequest body = Api.read(request, PaymentRequest.class);
            FinancialTransaction payment = finances.pay(
                    Api.userId(request),
                    body.applicationId,
                    body.amount,
                    body.note
            );
            Api.json(response, HttpServletResponse.SC_CREATED, payment);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, exception.getMessage());
        }
    }

    static class PaymentRequest {
        long applicationId;
        BigDecimal amount;
        String note;
    }
}
