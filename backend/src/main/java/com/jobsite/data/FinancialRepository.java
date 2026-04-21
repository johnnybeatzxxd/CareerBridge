package com.jobsite.data;

import com.jobsite.model.FinancialTransaction;
import com.jobsite.model.WalletSummary;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class FinancialRepository {
    public FinancialTransaction pay(long employerId, long applicationId, BigDecimal amount, String note) throws SQLException {
        requirePositive(amount);
        try (Connection connection = Database.connection()) {
            connection.setAutoCommit(false);
            try {
                long seekerId;
                try (PreparedStatement statement = connection.prepareStatement("""
                        select a.seeker_id
                        from applications a join jobs j on j.id = a.job_id
                        where a.id = ? and j.employer_id = ? and a.status = 'HIRED'
                        for update
                        """)) {
                    statement.setLong(1, applicationId);
                    statement.setLong(2, employerId);
                    try (ResultSet resultSet = statement.executeQuery()) {
                        if (!resultSet.next()) {
                            throw new SQLException("Only hired candidates can be paid");
                        }
                        seekerId = resultSet.getLong("seeker_id");
                    }
                }

                long transactionId;
                try (PreparedStatement statement = connection.prepareStatement("""
                        insert into financial_transactions
                            (application_id, employer_id, seeker_id, type, amount, note)
                        values (?, ?, ?, 'PAYMENT', ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS)) {
                    statement.setLong(1, applicationId);
                    statement.setLong(2, employerId);
                    statement.setLong(3, seekerId);
                    statement.setBigDecimal(4, amount);
                    statement.setString(5, blankToNull(note));
                    statement.executeUpdate();
                    try (ResultSet keys = statement.getGeneratedKeys()) {
                        keys.next();
                        transactionId = keys.getLong(1);
                    }
                }
                connection.commit();
                return findById(transactionId, employerId, "EMPLOYER");
            } catch (Exception exception) {
                connection.rollback();
                if (exception instanceof SQLException sqlException) {
                    throw sqlException;
                }
                throw new SQLException("Unable to record payment", exception);
            }
        }
    }

    public FinancialTransaction withdraw(
            long seekerId,
            BigDecimal amount,
            String payoutMethod,
            String payoutAccount
    ) throws SQLException {
        requirePositive(amount);
        if (payoutMethod == null || payoutMethod.isBlank() || payoutAccount == null || payoutAccount.isBlank()) {
            throw new SQLException("Payout method and account are required");
        }

        try (Connection connection = Database.connection()) {
            connection.setAutoCommit(false);
            try {
                try (PreparedStatement statement = connection.prepareStatement(
                        "select id from users where id = ? and role = 'JOB_SEEKER' for update"
                )) {
                    statement.setLong(1, seekerId);
                    try (ResultSet resultSet = statement.executeQuery()) {
                        if (!resultSet.next()) {
                            throw new SQLException("Job seeker account not found");
                        }
                    }
                }
                BigDecimal balance = balance(connection, seekerId);
                if (amount.compareTo(balance) > 0) {
                    throw new SQLException("Withdrawal exceeds available balance");
                }

                long transactionId;
                try (PreparedStatement statement = connection.prepareStatement("""
                        insert into financial_transactions
                            (seeker_id, type, amount, payout_method, payout_account)
                        values (?, 'WITHDRAWAL', ?, ?, ?)
                        """, Statement.RETURN_GENERATED_KEYS)) {
                    statement.setLong(1, seekerId);
                    statement.setBigDecimal(2, amount);
                    statement.setString(3, payoutMethod);
                    statement.setString(4, payoutAccount);
                    statement.executeUpdate();
                    try (ResultSet keys = statement.getGeneratedKeys()) {
                        keys.next();
                        transactionId = keys.getLong(1);
                    }
                }
                connection.commit();
                return findById(transactionId, seekerId, "JOB_SEEKER");
            } catch (Exception exception) {
                connection.rollback();
                if (exception instanceof SQLException sqlException) {
                    throw sqlException;
                }
                throw new SQLException("Unable to record withdrawal", exception);
            }
        }
    }

    public List<FinancialTransaction> findForEmployer(long employerId) throws SQLException {
        return query("""
                select t.*, j.title job_title, e.company_name employer_name, s.name seeker_name
                from financial_transactions t
                left join applications a on a.id = t.application_id
                left join jobs j on j.id = a.job_id
                left join users e on e.id = t.employer_id
                join users s on s.id = t.seeker_id
                where t.employer_id = ? and t.type = 'PAYMENT'
                order by t.created_at desc, t.id desc
                """, employerId);
    }

    public WalletSummary wallet(long seekerId) throws SQLException {
        WalletSummary summary = new WalletSummary();
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     select
                         coalesce(sum(case when type = 'PAYMENT' and status = 'COMPLETED' then amount else 0 end), 0) earned,
                         coalesce(sum(case when type = 'WITHDRAWAL' and status = 'COMPLETED' then amount else 0 end), 0) withdrawn
                     from financial_transactions where seeker_id = ?
                     """)) {
            statement.setLong(1, seekerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                summary.totalEarned = resultSet.getBigDecimal("earned");
                summary.totalWithdrawn = resultSet.getBigDecimal("withdrawn");
                summary.availableBalance = summary.totalEarned.subtract(summary.totalWithdrawn);
            }
        }
        summary.transactions = findForSeeker(seekerId);
        return summary;
    }

    private List<FinancialTransaction> findForSeeker(long seekerId) throws SQLException {
        return query("""
                select t.*, j.title job_title, e.company_name employer_name, s.name seeker_name
                from financial_transactions t
                left join applications a on a.id = t.application_id
                left join jobs j on j.id = a.job_id
                left join users e on e.id = t.employer_id
                join users s on s.id = t.seeker_id
                where t.seeker_id = ?
                order by t.created_at desc, t.id desc
                """, seekerId);
    }

    private FinancialTransaction findById(long id, long ownerId, String role) throws SQLException {
        String ownerColumn = "EMPLOYER".equals(role) ? "t.employer_id" : "t.seeker_id";
        List<FinancialTransaction> transactions = query("""
                select t.*, j.title job_title, e.company_name employer_name, s.name seeker_name
                from financial_transactions t
                left join applications a on a.id = t.application_id
                left join jobs j on j.id = a.job_id
                left join users e on e.id = t.employer_id
                join users s on s.id = t.seeker_id
                where t.id = ? and %s = ?
                """.formatted(ownerColumn), id, ownerId);
        if (transactions.isEmpty()) {
            throw new SQLException("Transaction not found");
        }
        return transactions.get(0);
    }

    private List<FinancialTransaction> query(String sql, long id) throws SQLException {
        return query(sql, id, null);
    }

    private List<FinancialTransaction> query(String sql, long first, Long second) throws SQLException {
        List<FinancialTransaction> transactions = new ArrayList<>();
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, first);
            if (second != null) {
                statement.setLong(2, second);
            }
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    transactions.add(map(resultSet));
                }
            }
        }
        return transactions;
    }

    private BigDecimal balance(Connection connection, long seekerId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                select
                    coalesce(sum(case when type = 'PAYMENT' and status = 'COMPLETED' then amount else 0 end), 0)
                    - coalesce(sum(case when type = 'WITHDRAWAL' and status = 'COMPLETED' then amount else 0 end), 0)
                from financial_transactions where seeker_id = ?
                """)) {
            statement.setLong(1, seekerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getBigDecimal(1);
            }
        }
    }

    private FinancialTransaction map(ResultSet resultSet) throws SQLException {
        FinancialTransaction transaction = new FinancialTransaction();
        transaction.id = resultSet.getLong("id");
        transaction.applicationId = nullableLong(resultSet, "application_id");
        transaction.employerId = nullableLong(resultSet, "employer_id");
        transaction.seekerId = resultSet.getLong("seeker_id");
        transaction.type = resultSet.getString("type");
        transaction.amount = resultSet.getBigDecimal("amount");
        transaction.note = resultSet.getString("note");
        transaction.payoutMethod = resultSet.getString("payout_method");
        transaction.payoutAccount = resultSet.getString("payout_account");
        transaction.status = resultSet.getString("status");
        transaction.jobTitle = resultSet.getString("job_title");
        transaction.employerName = resultSet.getString("employer_name");
        transaction.seekerName = resultSet.getString("seeker_name");
        transaction.createdAt = String.valueOf(resultSet.getTimestamp("created_at"));
        return transaction;
    }

    private Long nullableLong(ResultSet resultSet, String column) throws SQLException {
        long value = resultSet.getLong(column);
        return resultSet.wasNull() ? null : value;
    }

    private void requirePositive(BigDecimal amount) throws SQLException {
        if (amount == null || amount.scale() > 2 || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new SQLException("Amount must be greater than zero with at most two decimal places");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
