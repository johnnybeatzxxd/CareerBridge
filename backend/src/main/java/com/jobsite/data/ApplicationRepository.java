package com.jobsite.data;

import com.jobsite.model.Application;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class ApplicationRepository {
    public Application create(long jobId, long seekerId, String coverLetter) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     insert into applications (job_id, seeker_id, cover_letter) values (?, ?, ?)
                     """, Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, jobId);
            statement.setLong(2, seekerId);
            statement.setString(3, coverLetter);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                long id = keys.getLong(1);
                return findForSeeker(seekerId).stream().filter(item -> item.id == id).findFirst().orElseThrow();
            }
        }
    }

    public List<Application> findForSeeker(long seekerId) throws SQLException {
        return query("""
                select a.*, j.title job_title, u.company_name, s.name seeker_name, s.email seeker_email
                from applications a
                join jobs j on j.id = a.job_id
                join users u on u.id = j.employer_id
                join users s on s.id = a.seeker_id
                where a.seeker_id = ?
                order by a.created_at desc
                """, seekerId);
    }

    public List<Application> findForEmployer(long employerId) throws SQLException {
        return query("""
                select a.*, j.title job_title, u.company_name, s.name seeker_name, s.email seeker_email
                from applications a
                join jobs j on j.id = a.job_id
                join users u on u.id = j.employer_id
                join users s on s.id = a.seeker_id
                where j.employer_id = ?
                order by a.created_at desc
                """, employerId);
    }

    public void updateStatus(long id, long employerId, String status) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     update applications set status = ?
                     where id = ? and job_id in (select id from jobs where employer_id = ?)
                     """)) {
            statement.setString(1, status);
            statement.setLong(2, id);
            statement.setLong(3, employerId);
            statement.executeUpdate();
        }
    }

    public int countForSeeker(long seekerId) throws SQLException {
        return count("select count(*) from applications where seeker_id = ?", seekerId);
    }

    public int countForEmployer(long employerId) throws SQLException {
        return count("select count(*) from applications a join jobs j on j.id = a.job_id where j.employer_id = ?", employerId);
    }

    private List<Application> query(String sql, long id) throws SQLException {
        List<Application> applications = new ArrayList<>();
        try (Connection connection = Database.connection(); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    applications.add(map(resultSet));
                }
            }
        }
        return applications;
    }

    private int count(String sql, long id) throws SQLException {
        try (Connection connection = Database.connection(); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1);
            }
        }
    }

    private Application map(ResultSet resultSet) throws SQLException {
        Application application = new Application();
        application.id = resultSet.getLong("id");
        application.jobId = resultSet.getLong("job_id");
        application.seekerId = resultSet.getLong("seeker_id");
        application.seekerName = resultSet.getString("seeker_name");
        application.seekerEmail = resultSet.getString("seeker_email");
        application.jobTitle = resultSet.getString("job_title");
        application.companyName = resultSet.getString("company_name");
        application.coverLetter = resultSet.getString("cover_letter");
        application.status = resultSet.getString("status");
        application.createdAt = String.valueOf(resultSet.getTimestamp("created_at"));
        return application;
    }
}
