package com.jobsite.data;

import com.jobsite.model.Application;
import com.jobsite.model.CandidateProfile;
import com.jobsite.model.CvProfile;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
                select a.*, j.title job_title, j.price job_price, u.company_name, s.name seeker_name, s.email seeker_email,
                       coalesce((select sum(t.amount) from financial_transactions t
                                 where t.application_id = a.id and t.type = 'PAYMENT' and t.status = 'COMPLETED'), 0) total_paid
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
                select a.*, j.title job_title, j.price job_price, u.company_name, s.name seeker_name, s.email seeker_email,
                       coalesce((select sum(t.amount) from financial_transactions t
                                 where t.application_id = a.id and t.type = 'PAYMENT' and t.status = 'COMPLETED'), 0) total_paid
                from applications a
                join jobs j on j.id = a.job_id
                join users u on u.id = j.employer_id
                join users s on s.id = a.seeker_id
                where j.employer_id = ?
                order by a.created_at desc
                """, employerId);
    }

    public void updateStatus(long id, long employerId, String status) throws SQLException {
        if (!List.of("SUBMITTED", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED").contains(status)) {
            throw new SQLException("Invalid application status");
        }
        try (Connection connection = Database.connection()) {
            connection.setAutoCommit(false);
            try (PreparedStatement statement = connection.prepareStatement("""
                    update applications set status = ?
                    where id = ? and job_id in (select id from jobs where employer_id = ?)
                    """)) {
                statement.setString(1, status);
                statement.setLong(2, id);
                statement.setLong(3, employerId);
                if (statement.executeUpdate() == 0) {
                    throw new SQLException("Application not found");
                }
            }
            if ("HIRED".equals(status)) {
                try (PreparedStatement statement = connection.prepareStatement("""
                        update jobs set status = 'CLOSED'
                        where employer_id = ? and id = (select job_id from applications where id = ?)
                        """)) {
                    statement.setLong(1, employerId);
                    statement.setLong(2, id);
                    statement.executeUpdate();
                }
            }
            connection.commit();
        }
    }

    public int countForSeeker(long seekerId) throws SQLException {
        return count("select count(*) from applications where seeker_id = ?", seekerId);
    }

    public int countForEmployer(long employerId) throws SQLException {
        return count("select count(*) from applications a join jobs j on j.id = a.job_id where j.employer_id = ?", employerId);
    }

    public Optional<CandidateProfile> findCandidateProfile(long applicationId, long employerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     select a.id application_id, a.seeker_id, a.status application_status,
                            a.cover_letter, a.created_at applied_at, j.title job_title,
                            s.name, s.email, cv.headline, cv.summary, cv.skills, cv.experience,
                            cv.education, cv.file_name, cv.updated_at resume_updated_at
                     from applications a
                     join jobs j on j.id = a.job_id
                     join users s on s.id = a.seeker_id
                     left join cv_profiles cv on cv.seeker_id = a.seeker_id
                     where a.id = ? and j.employer_id = ?
                     """)) {
            statement.setLong(1, applicationId);
            statement.setLong(2, employerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapCandidateProfile(resultSet)) : Optional.empty();
            }
        }
    }

    public Optional<CvProfile> findCandidateResumeFile(long applicationId, long employerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("""
                     select cv.*
                     from applications a
                     join jobs j on j.id = a.job_id
                     join cv_profiles cv on cv.seeker_id = a.seeker_id
                     where a.id = ? and j.employer_id = ? and cv.file_path is not null
                     """)) {
            statement.setLong(1, applicationId);
            statement.setLong(2, employerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return Optional.empty();
                }
                CvProfile cv = new CvProfile();
                cv.seekerId = resultSet.getLong("seeker_id");
                cv.fileName = resultSet.getString("file_name");
                cv.filePath = resultSet.getString("file_path");
                return Optional.of(cv);
            }
        }
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
        application.jobPrice = resultSet.getBigDecimal("job_price");
        application.companyName = resultSet.getString("company_name");
        application.coverLetter = resultSet.getString("cover_letter");
        application.status = resultSet.getString("status");
        application.totalPaid = resultSet.getBigDecimal("total_paid");
        application.createdAt = String.valueOf(resultSet.getTimestamp("created_at"));
        return application;
    }

    private CandidateProfile mapCandidateProfile(ResultSet resultSet) throws SQLException {
        CandidateProfile profile = new CandidateProfile();
        profile.applicationId = resultSet.getLong("application_id");
        profile.seekerId = resultSet.getLong("seeker_id");
        profile.name = resultSet.getString("name");
        profile.email = resultSet.getString("email");
        profile.jobTitle = resultSet.getString("job_title");
        profile.applicationStatus = resultSet.getString("application_status");
        profile.coverLetter = resultSet.getString("cover_letter");
        profile.appliedAt = String.valueOf(resultSet.getTimestamp("applied_at"));
        profile.headline = resultSet.getString("headline");
        profile.summary = resultSet.getString("summary");
        profile.skills = resultSet.getString("skills");
        profile.experience = resultSet.getString("experience");
        profile.education = resultSet.getString("education");
        profile.resumeFileName = resultSet.getString("file_name");
        profile.resumeUpdatedAt = String.valueOf(resultSet.getTimestamp("resume_updated_at"));
        return profile;
    }
}
