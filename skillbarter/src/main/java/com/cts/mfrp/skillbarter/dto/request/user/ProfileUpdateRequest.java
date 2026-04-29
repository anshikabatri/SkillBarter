package com.cts.mfrp.skillbarter.dto.request.user;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateRequest(
        @NotBlank String name,
        String bio,
        String profilePhotoUrl,
        String languagesSpoken,
        String email
) {
}
