package com.cts.mfrp.skillbarter.dto.request.user;

import jakarta.validation.constraints.NotBlank;

public record PasswordRequest(
        @NotBlank String password
) {
}
