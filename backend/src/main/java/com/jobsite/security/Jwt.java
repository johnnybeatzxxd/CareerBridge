package com.jobsite.security;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.jobsite.config.Env;
import com.jobsite.model.User;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

public final class Jwt {
    private static final Gson GSON = new Gson();
    private static final Type MAP_TYPE = new TypeToken<Map<String, Object>>() {}.getType();
    private static final String SECRET = Env.getOrDefault("JWT_SECRET", "change-this-secret-for-production");
    private static final long TTL_SECONDS = Long.parseLong(Env.getOrDefault("ACCESS_TOKEN_TTL_SECONDS", "900"));

    private Jwt() {
    }

    public static String issue(User user) {
        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.id);
        payload.put("name", user.name);
        payload.put("email", user.email);
        payload.put("role", user.role);
        payload.put("exp", Instant.now().getEpochSecond() + TTL_SECONDS);
        String unsigned = encode(GSON.toJson(header)) + "." + encode(GSON.toJson(payload));
        return unsigned + "." + sign(unsigned);
    }

    public static Map<String, Object> verify(String token) {
        String[] parts = token == null ? new String[0] : token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid token");
        }
        String unsigned = parts[0] + "." + parts[1];
        if (!constantTimeEquals(sign(unsigned), parts[2])) {
            throw new IllegalArgumentException("Invalid token signature");
        }
        String json = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        Map<String, Object> claims = GSON.fromJson(json, MAP_TYPE);
        Number exp = (Number) claims.get("exp");
        if (exp == null || exp.longValue() < Instant.now().getEpochSecond()) {
            throw new IllegalArgumentException("Token expired");
        }
        return claims;
    }

    private static String encode(String json) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private static String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign token", exception);
        }
    }

    private static boolean constantTimeEquals(String left, String right) {
        if (left.length() != right.length()) {
            return false;
        }
        int diff = 0;
        for (int index = 0; index < left.length(); index++) {
            diff |= left.charAt(index) ^ right.charAt(index);
        }
        return diff == 0;
    }
}
