package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
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

    // ── Inner request/response classes ───────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Getter @AllArgsConstructor
    public static class LoginResponse {
        private String token;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @Email @NotBlank private String email;
    }

    @Getter @AllArgsConstructor
    public static class ForgotPasswordResponse {
        private String message;
        private String resetToken;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank private String token;
        @NotBlank private String newPassword;
    }

    @Getter @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}