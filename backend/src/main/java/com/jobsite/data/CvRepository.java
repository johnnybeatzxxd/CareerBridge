package com.jobsite.data;

import com.jobsite.model.CvProfile;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class CvRepository {
    public Optional<CvProfile> find(long seekerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("select * from cv_profiles where seeker_id = ?")) {
            statement.setLong(1, seekerId);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(map(resultSet)) : Optional.empty();
            }
        }
    }

    public CvProfile save(long seekerId, CvProfile cv) throws SQLException {
        try (Connection connection = Database.connection()) {
            try (PreparedStatement statement = connection.prepareStatement("""
                    update cv_profiles
                    set headline = ?, summary = ?, skills = ?, experience = ?, education = ?, updated_at = current_timestamp
                    where seeker_id = ?
                    """)) {
                statement.setString(1, cv.headline);
                statement.setString(2, cv.summary);
                statement.setString(3, cv.skills);
                statement.setString(4, cv.experience);
                statement.setString(5, cv.education);
                statement.setLong(6, seekerId);
                if (statement.executeUpdate() == 0) {
                    try (PreparedStatement insert = connection.prepareStatement("""
                            insert into cv_profiles (seeker_id, headline, summary, skills, experience, education)
                            values (?, ?, ?, ?, ?, ?)
                            """)) {
                        insert.setLong(1, seekerId);
                        insert.setString(2, cv.headline);
                        insert.setString(3, cv.summary);
                        insert.setString(4, cv.skills);
                        insert.setString(5, cv.experience);
                        insert.setString(6, cv.education);
                        insert.executeUpdate();
                    }
                }
            }
            return find(seekerId).orElseThrow();
        }
    }

    public void attachFile(long seekerId, String fileName, String filePath) throws SQLException {
        try (Connection connection = Database.connection()) {
            try (PreparedStatement statement = connection.prepareStatement("""
                    update cv_profiles
                    set file_name = ?, file_path = ?, updated_at = current_timestamp
                    where seeker_id = ?
                    """)) {
                statement.setString(1, fileName);
                statement.setString(2, filePath);
                statement.setLong(3, seekerId);
                if (statement.executeUpdate() == 0) {
                    try (PreparedStatement insert = connection.prepareStatement("""
                            insert into cv_profiles (seeker_id, file_name, file_path) values (?, ?, ?)
                            """)) {
                        insert.setLong(1, seekerId);
                        insert.setString(2, fileName);
                        insert.setString(3, filePath);
                        insert.executeUpdate();
                    }
                }
            }
        }
    }

    public List<Map<String, Object>> templates() throws SQLException {
        List<Map<String, Object>> templates = new ArrayList<>();
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("select * from cv_templates where active = true order by id");
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                templates.add(Map.of("id", resultSet.getLong("id"), "name", resultSet.getString("name"), "body", resultSet.getString("body")));
            }
        }
        return templates;
    }

    public void delete(long seekerId) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("delete from cv_profiles where seeker_id = ?")) {
            statement.setLong(1, seekerId);
            statement.executeUpdate();
        }
    }

    public void saveTemplate(String name, String body) throws SQLException {
        try (Connection connection = Database.connection();
             PreparedStatement statement = connection.prepareStatement("insert into cv_templates (name, body) values (?, ?)")) {
            statement.setString(1, name);
            statement.setString(2, body);
            statement.executeUpdate();
        }
    }

    private CvProfile map(ResultSet resultSet) throws SQLException {
        CvProfile cv = new CvProfile();
        cv.seekerId = resultSet.getLong("seeker_id");
        cv.headline = resultSet.getString("headline");
        cv.summary = resultSet.getString("summary");
        cv.skills = resultSet.getString("skills");
        cv.experience = resultSet.getString("experience");
        cv.education = resultSet.getString("education");
        cv.fileName = resultSet.getString("file_name");
        cv.filePath = resultSet.getString("file_path");
        cv.updatedAt = String.valueOf(resultSet.getTimestamp("updated_at"));
        return cv;
    }
}
