package com.jobsite.data;

import com.jobsite.model.PendingRegistration;
import com.jobsite.model.User;
import com.jobsite.security.Passwords;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

public class VerificationRepository {
    public void save(
            String name,
            String email,
            String password,
            String role,
            String companyName,
            String companyEmail,
            String otpHash,
            Instant expiresAt,
            Instant resendAvailableAt
    ) throws SQLException {
        String normalizedEmail = email.toLowerCase();
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     merge into pending_registrations
                         (email, name, password_hash, role, company_name, company_email, otp_hash,
                          expires_at, resend_available_at, attempts, created_at)
                     key(email) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, current_timestamp)
                     """)) {
            statement.setString(1, normalizedEmail);
            statement.setString(2, name);
            statement.setString(3, Passwords.hash(password));
            statement.setString(4, role);
            statement.setString(5, companyName);
            statement.setString(6, companyEmail);
            statement.setString(7, otpHash);
            statement.setTimestamp(8, Timestamp.from(expiresAt));
            statement.setTimestamp(9, Timestamp.from(resendAvailableAt));
            statement.executeUpdate();
        }
    }

    public User verify(String email, String otpHash) throws SQLException {
        String normalizedEmail = email.toLowerCase();
        try (Connection connection = Database.connection()) {
            connection.setAutoCommit(false);
            try {
                PendingRegistration pending;
                try (PreparedStatement statement = connection.prepareStatement("""
                        select * from pending_registrations where email = ? for update
                        """)) {
                    statement.setString(1, normalizedEmail);
                    try (ResultSet resultSet = statement.executeQuery()) {
                        if (!resultSet.next()) throw new SQLException("No pending verification was found");
                        if (resultSet.getInt("attempts") >= 5) throw new SQLException("Too many incorrect attempts. Request a new code");
                        if (resultSet.getTimestamp("expires_at").toInstant().isBefore(Instant.now())) {
                            throw new SQLException("Verification code has expired");
                        }
                        if (!resultSet.getString("otp_hash").equals(otpHash)) {
                            incrementAttempts(connection, normalizedEmail);
                            connection.commit();
                            throw new SQLException("Incorrect verification code");
                        }
                        pending = map(resultSet);
                    }
                }
                User user = createUser(connection, pending);
                try (PreparedStatement statement = connection.prepareStatement(
                        "delete from pending_registrations where email = ?"
                )) {
                    statement.setString(1, normalizedEmail);
                    statement.executeUpdate();
                }
                connection.commit();
                return user;
            } catch (Exception exception) {
                if (!connection.getAutoCommit()) connection.rollback();
                if (exception instanceof SQLException sqlException) throw sqlException;
                throw new SQLException("Unable to verify email", exception);
            }
        }
    }

    public Optional<PendingRegistration> findForResend(String email) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement(
                     "select * from pending_registrations where email = ?"
             )) {
            statement.setString(1, email.toLowerCase());
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) return Optional.empty();
                if (resultSet.getTimestamp("resend_available_at").toInstant().isAfter(Instant.now())) {
                    throw new SQLException("Please wait before requesting another code");
                }
                return Optional.of(map(resultSet));
            }
        }
    }

    public void updateCode(String email, String otpHash, Instant expiresAt, Instant resendAvailableAt) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     update pending_registrations
                     set otp_hash = ?, expires_at = ?, resend_available_at = ?, attempts = 0
                     where email = ?
                     """)) {
            statement.setString(1, otpHash);
            statement.setTimestamp(2, Timestamp.from(expiresAt));
            statement.setTimestamp(3, Timestamp.from(resendAvailableAt));
            statement.setString(4, email.toLowerCase());
            if (statement.executeUpdate() == 0) throw new SQLException("No pending verification was found");
        }
    }

    private User createUser(Connection connection, PendingRegistration pending) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                insert into users (name, email, password_hash, role, company_name, company_email, approved)
                values (?, ?, ?, ?, ?, ?, true)
                """, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, pending.name);
            statement.setString(2, pending.email);
            statement.setString(3, pending.passwordHash);
            statement.setString(4, pending.role);
            statement.setString(5, pending.companyName);
            statement.setString(6, pending.companyEmail);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                long id = keys.getLong(1);
                return findUser(connection, id);
            }
        }
    }

    private User findUser(Connection connection, long id) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("select * from users where id = ?")) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                User user = new User();
                user.id = resultSet.getLong("id");
                user.name = resultSet.getString("name");
                user.email = resultSet.getString("email");
                user.role = resultSet.getString("role");
                user.companyName = resultSet.getString("company_name");
                user.companyEmail = resultSet.getString("company_email");
                user.approved = resultSet.getBoolean("approved");
                user.active = resultSet.getBoolean("active");
                return user;
            }
        }
    }

    private void incrementAttempts(Connection connection, String email) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "update pending_registrations set attempts = attempts + 1 where email = ?"
        )) {
            statement.setString(1, email);
            statement.executeUpdate();
        }
    }

    private PendingRegistration map(ResultSet resultSet) throws SQLException {
        PendingRegistration pending = new PendingRegistration();
        pending.name = resultSet.getString("name");
        pending.email = resultSet.getString("email");
        pending.passwordHash = resultSet.getString("password_hash");
        pending.role = resultSet.getString("role");
        pending.companyName = resultSet.getString("company_name");
        pending.companyEmail = resultSet.getString("company_email");
        return pending;
    }
}
