package com.jobsite.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class Env {
    private static final Map<String, String> FILE_VALUES = load();

    private Env() {
    }

    public static String get(String name) {
        String environmentValue = System.getenv(name);
        return environmentValue != null ? environmentValue : FILE_VALUES.get(name);
    }

    public static String getOrDefault(String name, String defaultValue) {
        String value = get(name);
        return value == null ? defaultValue : value;
    }

    public static String require(String name) {
        String value = get(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is not configured in the environment or backend/.env");
        }
        return value;
    }

    private static Map<String, String> load() {
        for (Path candidate : candidates()) {
            if (Files.isRegularFile(candidate)) {
                return read(candidate);
            }
        }
        return Map.of();
    }

    private static List<Path> candidates() {
        return List.of(
                Path.of(".env"),
                Path.of("backend", ".env"),
                Path.of("..", "backend", ".env")
        );
    }

    private static Map<String, String> read(Path path) {
        Map<String, String> values = new HashMap<>();
        try {
            for (String rawLine : Files.readAllLines(path)) {
                String line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                if (line.startsWith("export ")) line = line.substring("export ".length()).trim();

                int separator = line.indexOf('=');
                if (separator <= 0) continue;

                String name = line.substring(0, separator).trim();
                String value = line.substring(separator + 1).trim();
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                } else {
                    int comment = value.indexOf(" #");
                    if (comment >= 0) value = value.substring(0, comment).trim();
                }
                values.put(name, value);
            }
            return Map.copyOf(values);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read " + path.toAbsolutePath(), exception);
        }
    }
}
