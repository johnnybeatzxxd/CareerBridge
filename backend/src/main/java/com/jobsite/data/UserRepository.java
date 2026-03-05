package com.jobsite.data;

import com.jobsite.model.User;
import com.jobsite.security.Passwords;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;

public class UserRepository {
    public User create(String name, String email, String password, String role, String companyName, String companyEmail) throws SQLException {
        String sql = """
                insert into users (name, email, password_hash, role, company_name, company_email, approved)
                values (?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, name);
            statement.setString(2, email.toLowerCase());
            statement.setString(3, Passwords.hash(password));
            statement.setString(4, role);
            statement.setString(5, companyName);
            statement.setString(6, companyEmail);
            statement.setBoolean(7, !"EMPLOYER".equals(role));
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                return findById(keys.getLong(1)).orElseThrow();
            }
        }
    }

    public Optional<User> authenticate(String email, String password) throws SQLException {
        String sql = "select * from users where email = ? and active = true";
        try (Connection connection = Database.connection(); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email.toLowerCase());
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next() && Passwords.verify(password, resultSet.getString("password_hash"))) {
                    return Optional.of(map(resultSet));
                }
            }
        }
        return Optional.empty();
    }

    public Optional<User> findById(long id) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("select * from users where id = ?")) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(map(resultSet)) : Optional.empty();
            }
        }
    }

    private User map(ResultSet resultSet) throws SQLException {
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
