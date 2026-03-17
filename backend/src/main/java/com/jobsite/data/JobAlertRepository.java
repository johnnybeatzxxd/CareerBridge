package com.jobsite.data;

import com.jobsite.model.JobAlert;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class JobAlertRepository {
    private final JobRepository jobs = new JobRepository();

    public List<JobAlert> findForSeeker(long seekerId) throws SQLException {
        List<JobAlert> alerts = new ArrayList<>();
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("select * from job_alerts where seeker_id = ? order by created_at desc")) {
            statement.setLong(1, seekerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    JobAlert alert = map(resultSet);
                    alert.matchingJobs = jobs.search(alert.keyword, alert.location, alert.jobType, null);
                    alerts.add(alert);
                }
            }
        }
        return alerts;
    }

    public JobAlert create(long seekerId, JobAlert alert) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     insert into job_alerts (seeker_id, keyword, location, job_type, active)
                     values (?, ?, ?, ?, ?)
                     """, Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, seekerId);
            statement.setString(2, alert.keyword);
            statement.setString(3, alert.location);
            statement.setString(4, alert.jobType);
            statement.setBoolean(5, alert.active == null || alert.active);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                long id = keys.getLong(1);
                return findForSeeker(seekerId).stream().filter(item -> item.id == id).findFirst().orElseThrow();
            }
        }
    }

    public void update(long id, long seekerId, JobAlert alert) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     update job_alerts
                     set keyword = ?, location = ?, job_type = ?, active = ?
                     where id = ? and seeker_id = ?
                     """)) {
            statement.setString(1, alert.keyword);
            statement.setString(2, alert.location);
            statement.setString(3, alert.jobType);
            statement.setBoolean(4, alert.active == null || alert.active);
            statement.setLong(5, id);
            statement.setLong(6, seekerId);
            statement.executeUpdate();
        }
    }

    public void delete(long id, long seekerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("delete from job_alerts where id = ? and seeker_id = ?")) {
            statement.setLong(1, id);
            statement.setLong(2, seekerId);
            statement.executeUpdate();
        }
    }

    public int countForSeeker(long seekerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("select count(*) from job_alerts where seeker_id = ?")) {
            statement.setLong(1, seekerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1);
            }
        }
    }

    private JobAlert map(ResultSet resultSet) throws SQLException {
        JobAlert alert = new JobAlert();
        alert.id = resultSet.getLong("id");
        alert.seekerId = resultSet.getLong("seeker_id");
        alert.keyword = resultSet.getString("keyword");
        alert.location = resultSet.getString("location");
        alert.jobType = resultSet.getString("job_type");
        alert.active = resultSet.getBoolean("active");
        alert.createdAt = String.valueOf(resultSet.getTimestamp("created_at"));
        return alert;
    }
}
