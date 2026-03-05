package com.jobsite.web;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

public final class Api {
    public static final Gson GSON = new Gson();

    private Api() {
    }

    public static <T> T read(HttpServletRequest request, Class<T> type) throws IOException {
        return GSON.fromJson(request.getReader(), type);
    }

    public static void json(HttpServletResponse response, int status, Object body) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        GSON.toJson(body, response.getWriter());
    }

    public static void error(HttpServletResponse response, int status, String message) throws IOException {
        json(response, status, Map.of("error", message));
    }

    public static String path(HttpServletRequest request) {
        String path = request.getPathInfo();
        return path == null ? "/" : path;
    }
}
