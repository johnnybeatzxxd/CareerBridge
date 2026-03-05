package com.jobsite.data;

import com.jobsite.security.Passwords;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public final class Database {
    private static final String URL = System.getenv().getOrDefault(
            "DB_URL",
            "jdbc:h2:file:./data/jobsite;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE"
    );
    private static final String USER = System.getenv().getOrDefault("DB_USER", "sa");
    private static final String PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "");

    private Database() {
    }

    public static Connection connection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void initialize() {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("""
                    create table if not exists users (
                        id identity primary key,
                        name varchar(120) not null,
                        email varchar(180) not null unique,
                        password_hash varchar(255) not null,
                        role varchar(30) not null,
                        company_name varchar(160),
                        company_email varchar(180),
                        approved boolean not null default false,
                        active boolean not null default true,
                        created_at timestamp not null default current_timestamp
                    )
                    """);

            statement.execute("""
                    merge into users key(email) values (
                        1,
                        'System Administrator',
                        'admin@example.com',
                        '%s',
                        'ADMIN',
                        null,
                        null,
                        true,
                        true,
                        current_timestamp
                    )
                    """.formatted(Passwords.hash("admin123")));
        } catch (SQLException exception) {
            throw new IllegalStateException("Unable to initialize database", exception);
        }
    }
}
