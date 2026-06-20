package com.jobsite.service;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

public class EmailService {
    public void sendVerificationCode(String recipient, String name, String code) {
        String username = required("SMTP_USERNAME");
        String password = required("SMTP_APP_PASSWORD");
        String host = System.getenv().getOrDefault("SMTP_HOST", "smtp.gmail.com");
        String port = System.getenv().getOrDefault("SMTP_PORT", "587");
        boolean auth = Boolean.parseBoolean(System.getenv().getOrDefault("SMTP_AUTH", "true"));
        boolean startTls = Boolean.parseBoolean(System.getenv().getOrDefault("SMTP_STARTTLS", "true"));

        Properties properties = new Properties();
        properties.put("mail.smtp.host", host);
        properties.put("mail.smtp.port", port);
        properties.put("mail.smtp.auth", String.valueOf(auth));
        properties.put("mail.smtp.starttls.enable", String.valueOf(startTls));
        properties.put("mail.smtp.starttls.required", String.valueOf(startTls));
        properties.put("mail.smtp.connectiontimeout", "10000");
        properties.put("mail.smtp.timeout", "10000");
        properties.put("mail.smtp.writetimeout", "10000");

        Session session = Session.getInstance(properties, auth ? new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        } : null);

        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username, "CareerBridge"));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(recipient));
            message.setSubject("Your CareerBridge verification code", "UTF-8");
            message.setText("""
                    Hello %s,

                    Your CareerBridge verification code is:

                    %s

                    This code expires in 10 minutes. If you did not request this account, you can ignore this email.

                    CareerBridge
                    """.formatted(name, code), "UTF-8");
            Transport.send(message);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to send verification email", exception);
        }
    }

    private String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is not configured");
        }
        return value;
    }
}
