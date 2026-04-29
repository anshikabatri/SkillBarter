package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.dto.request.auth.ForgotPasswordRequest;
import com.cts.mfrp.skillbarter.dto.request.auth.LoginRequest;
import com.cts.mfrp.skillbarter.dto.request.auth.RegisterRequest;
import com.cts.mfrp.skillbarter.dto.request.auth.ResetPasswordRequest;
import com.cts.mfrp.skillbarter.dto.response.auth.ForgotPasswordResponse;
import com.cts.mfrp.skillbarter.dto.response.auth.LoginResponse;
import com.cts.mfrp.skillbarter.dto.response.auth.MessageResponse;
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

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request.name(), request.email(), request.password()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.email(), request.password());
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = authService.createPasswordResetToken(request.email());
        return ResponseEntity.ok(new ForgotPasswordResponse(
                "Password reset token generated. Use it to reset your password.",
                resetToken
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(new MessageResponse("Password reset successful"));
    }
}