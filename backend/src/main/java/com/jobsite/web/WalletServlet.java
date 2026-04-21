package com.jobsite.web;

import com.jobsite.data.FinancialRepository;
import com.jobsite.model.FinancialTransaction;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;

public class WalletServlet extends HttpServlet {
    private final FinancialRepository finances = new FinancialRepository();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER")) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            Api.json(response, HttpServletResponse.SC_OK, finances.wallet(Api.userId(request)));
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load wallet");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!Api.hasRole(request, "JOB_SEEKER") || !"/withdrawals".equals(Api.path(request))) {
            Api.error(response, HttpServletResponse.SC_FORBIDDEN, "Job seeker account required");
            return;
        }
        try {
            WithdrawalRequest body = Api.read(request, WithdrawalRequest.class);
            FinancialTransaction withdrawal = finances.withdraw(
                    Api.userId(request),
                    body.amount,
                    body.payoutMethod,
                    body.payoutAccount
            );
            Api.json(response, HttpServletResponse.SC_CREATED, withdrawal);
        } catch (SQLException exception) {
            Api.error(response, HttpServletResponse.SC_BAD_REQUEST, exception.getMessage());
        }
    }

    static class WithdrawalRequest {
        BigDecimal amount;
        String payoutMethod;
        String payoutAccount;
    }
}
