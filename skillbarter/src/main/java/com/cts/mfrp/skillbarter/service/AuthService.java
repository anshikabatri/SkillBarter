package com.cts.service;

import com.cts.model.User;
import com.cts.repo.UserRepo;
import com.cts.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public User register(String name, String email, String rawPassword) {
        if (userRepo.existsByEmail(email))
            throw new RuntimeException("Email already registered: " + email);

        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .xp(0)
                .build();

        return userRepo.save(user);
    }

    public String login(String email, String rawPassword) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, rawPassword)
        );
        return jwtUtil.generateToken(email);
    }
}