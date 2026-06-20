package com.jobsite.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;

public final class Otp {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String SECRET = System.getenv().getOrDefault("OTP_SECRET", "change-this-otp-secret");

    private Otp() {
    }

    public static String generate() {
        return "%06d".formatted(RANDOM.nextInt(1_000_000));
    }

    public static String hash(String email, String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest((email.toLowerCase() + ":" + code + ":" + SECRET).getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash verification code", exception);
        }
    }
}
