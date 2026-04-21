package com.jobsite.data;

import com.jobsite.model.Job;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JobRepository {
    public Job create(long employerId, Job job) throws SQLException {
        String sql = """
                insert into jobs (employer_id, title, location, job_type, salary, description, requirements)
                values (?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bindJob(statement, employerId, job);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                keys.next();
                return findById(keys.getLong(1)).orElseThrow();
            }
        }
    }

    public List<Job> search(String query, String location, String jobType, Long employerId) throws SQLException {
        List<Job> jobs = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                select j.*, u.name employer_name, u.company_name, u.company_email
                from jobs j join users u on u.id = j.employer_id
                where 1 = 1
                """);
        List<Object> params = new ArrayList<>();
        if (employerId == null) {
            sql.append(" and j.status = 'OPEN' and u.active = true");
        } else {
            sql.append(" and j.employer_id = ?");
            params.add(employerId);
        }
        if (query != null && !query.isBlank()) {
            sql.append(" and (lower(j.title) like ? or lower(j.description) like ?)");
            params.add("%" + query.toLowerCase() + "%");
            params.add("%" + query.toLowerCase() + "%");
        }
        if (location != null && !location.isBlank()) {
            sql.append(" and lower(j.location) like ?");
            params.add("%" + location.toLowerCase() + "%");
        }
        if (jobType != null && !jobType.isBlank()) {
            sql.append(" and j.job_type = ?");
            params.add(jobType);
        }
        sql.append(" order by j.created_at desc");
        try (Connection connection = Database.connection(); PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            for (int index = 0; index < params.size(); index++) {
                statement.setObject(index + 1, params.get(index));
            }
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    jobs.add(map(resultSet));
                }
            }
        }
        return jobs;
    }

    public Optional<Job> findById(long id) throws SQLException {
        String sql = """
                select j.*, u.name employer_name, u.company_name, u.company_email
                from jobs j join users u on u.id = j.employer_id
                where j.id = ?
                """;
        try (Connection connection = Database.connection(); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(map(resultSet)) : Optional.empty();
            }
        }
    }

    public void update(long id, long employerId, Job job) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     update jobs
                     set title = ?, location = ?, job_type = ?, salary = ?, description = ?, requirements = ?, status = ?
                     where id = ? and employer_id = ?
                     """)) {
            statement.setString(1, job.title);
            statement.setString(2, job.location);
            statement.setString(3, job.jobType);
            statement.setString(4, job.salary);
            statement.setString(5, job.description);
            statement.setString(6, job.requirements);
            statement.setString(7, job.status == null ? "OPEN" : job.status);
            statement.setLong(8, id);
            statement.setLong(9, employerId);
            statement.executeUpdate();
        }
    }

    public void delete(long id, long employerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("delete from jobs where id = ? and employer_id = ?")) {
            statement.setLong(1, id);
            statement.setLong(2, employerId);
            statement.executeUpdate();
        }
    }

    private void bindJob(PreparedStatement statement, long employerId, Job job) throws SQLException {
        statement.setLong(1, employerId);
        statement.setString(2, job.title);
        statement.setString(3, job.location);
        statement.setString(4, job.jobType);
        statement.setString(5, job.salary);
        statement.setString(6, job.description);
        statement.setString(7, job.requirements);
    }

    private Job map(ResultSet resultSet) throws SQLException {
        Job job = new Job();
        job.id = resultSet.getLong("id");
        job.employerId = resultSet.getLong("employer_id");
        job.employerName = resultSet.getString("employer_name");
        job.companyName = resultSet.getString("company_name");
        job.companyEmail = resultSet.getString("company_email");
        job.title = resultSet.getString("title");
        job.location = resultSet.getString("location");
        job.jobType = resultSet.getString("job_type");
        job.salary = resultSet.getString("salary");
        job.description = resultSet.getString("description");
        job.requirements = resultSet.getString("requirements");
        job.status = resultSet.getString("status");
        job.createdAt = String.valueOf(resultSet.getTimestamp("created_at"));
        return job;
    }
}
