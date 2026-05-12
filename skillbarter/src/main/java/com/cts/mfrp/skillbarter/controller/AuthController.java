package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.dto.auth.ForgotPasswordRequest;
import com.cts.mfrp.skillbarter.dto.auth.ForgotPasswordResponse;
import com.cts.mfrp.skillbarter.dto.auth.LoginRequest;
import com.cts.mfrp.skillbarter.dto.auth.LoginResponse;
import com.cts.mfrp.skillbarter.dto.auth.MessageResponse;
import com.cts.mfrp.skillbarter.dto.auth.RegisterRequest;
import com.cts.mfrp.skillbarter.dto.auth.ResetPasswordRequest;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    // Body: { "name": "John", "email": "john@mail.com", "password": "secret123" }
    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(req.getName(), req.getEmail(), req.getPassword()));
    }

    // POST /api/auth/login
    // Body: { "email": "john@mail.com", "password": "secret123" }
    // Returns: { "token": "eyJ..." }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        String token = authService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    // POST /api/auth/forgot-password
    // Body: { "email": "john@mail.com" }
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String resetToken = authService.createPasswordResetToken(req.getEmail());
        return ResponseEntity.ok(new ForgotPasswordResponse(
                "Password reset token generated. Use it to reset your password.",
                resetToken
        ));
    }

    // POST /api/auth/reset-password
    // Body: { "token": "...", "newPassword": "newSecret123" }
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password reset successful"));
    }
}