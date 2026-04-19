package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import com.cts.mfrp.skillbarter.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @Value("${app.password-reset.token-expiry-minutes:15}")
    private long resetTokenExpiryMinutes;

    private final Map<String, ResetTokenData> resetTokens = new ConcurrentHashMap<>();

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

    public String createPasswordResetToken(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(resetTokenExpiryMinutes);
        resetTokens.put(token, new ResetTokenData(user.getEmail(), expiresAt));
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        ResetTokenData tokenData = resetTokens.get(token);
        if (tokenData == null) {
            throw new RuntimeException("Invalid reset token");
        }
        if (tokenData.expiresAt().isBefore(LocalDateTime.now())) {
            resetTokens.remove(token);
            throw new RuntimeException("Reset token has expired");
        }

        User user = userRepo.findByEmail(tokenData.email())
                .orElseThrow(() -> new RuntimeException("User not found for token"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        resetTokens.remove(token);
    }

    private record ResetTokenData(String email, LocalDateTime expiresAt) {}
}