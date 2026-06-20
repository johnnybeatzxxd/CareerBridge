package com.jobsite.data;

import com.jobsite.model.User;
import com.jobsite.security.RefreshTokens;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;

public class RefreshSessionRepository {
    public String create(long userId, Instant expiresAt) throws SQLException {
        String token = RefreshTokens.generate();
        try (Connection connection = Database.connection()) {
            insert(connection, token, userId, expiresAt);
        }
        return token;
    }

    public RotatedSession rotate(String currentToken, Instant expiresAt) throws SQLException {
        String currentHash = RefreshTokens.hash(currentToken);
        try (Connection connection = Database.connection()) {
            connection.setAutoCommit(false);
            try {
                User user;
                try (PreparedStatement statement = connection.prepareStatement("""
                        select u.*
                        from refresh_sessions r join users u on u.id = r.user_id
                        where r.token_hash = ? and r.expires_at > current_timestamp and u.active = true
                        for update
                        """)) {
                    statement.setString(1, currentHash);
                    try (ResultSet resultSet = statement.executeQuery()) {
                        if (!resultSet.next()) throw new SQLException("Refresh session is invalid or expired");
                        user = mapUser(resultSet);
                    }
                }
                delete(connection, currentHash);
                String nextToken = RefreshTokens.generate();
                insert(connection, nextToken, user.id, expiresAt);
                connection.commit();
                return new RotatedSession(user, nextToken);
            } catch (Exception exception) {
                connection.rollback();
                if (exception instanceof SQLException sqlException) throw sqlException;
                throw new SQLException("Unable to refresh session", exception);
            }
        }
    }

    public void revoke(String token) throws SQLException {
        if (token == null || token.isBlank()) return;
        try (Connection connection = Database.connection()) {
            delete(connection, RefreshTokens.hash(token));
        }
    }

    private void insert(Connection connection, String token, long userId, Instant expiresAt) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                insert into refresh_sessions (token_hash, user_id, expires_at) values (?, ?, ?)
                """)) {
            statement.setString(1, RefreshTokens.hash(token));
            statement.setLong(2, userId);
            statement.setTimestamp(3, Timestamp.from(expiresAt));
            statement.executeUpdate();
        }
    }

    private void delete(Connection connection, String tokenHash) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "delete from refresh_sessions where token_hash = ?"
        )) {
            statement.setString(1, tokenHash);
            statement.executeUpdate();
        }
    }

    private User mapUser(ResultSet resultSet) throws SQLException {
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

    public record RotatedSession(User user, String token) {
    }
}
