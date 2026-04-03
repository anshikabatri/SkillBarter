package com.cts.mfrp.skillbarter.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // Hash password before saving to DB
    public String hashPassword(String plainPassword) {
        return encoder.encode(plainPassword);
    }

    // Verify password during login
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return encoder.matches(plainPassword, hashedPassword);
    }
}