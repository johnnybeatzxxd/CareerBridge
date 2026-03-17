package com.jobsite.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

public class SystemRepository {
    public Map<String, Object> stats() throws SQLException {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("users", count("select count(*) from users"));
        stats.put("jobSeekers", count("select count(*) from users where role = 'JOB_SEEKER'"));
        stats.put("employers", count("select count(*) from users where role = 'EMPLOYER'"));
        stats.put("pendingEmployers", count("select count(*) from users where role = 'EMPLOYER' and approved = false"));
        stats.put("openJobs", count("select count(*) from jobs where status = 'OPEN'"));
        stats.put("applications", count("select count(*) from applications"));
        stats.put("cvProfiles", count("select count(*) from cv_profiles"));
        stats.put("jobAlerts", count("select count(*) from job_alerts"));
        return stats;
    }

    private int count(String sql) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            resultSet.next();
            return resultSet.getInt(1);
        }
    }
}
