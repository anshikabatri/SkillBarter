package com.cts.util;

import org.springframework.stereotype.Component;

@Component
public class ValidationUtil {

    // Check valid email format
    public boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(emailRegex);
    }

    // Check password strength
    public boolean isValidPassword(String password) {
        // Min 8 chars, at least one number
        return password != null && password.length() >= 8
                && password.matches(".*\\d.*");
    }

    // Check if string is empty or null
    public boolean isNullOrEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }
}