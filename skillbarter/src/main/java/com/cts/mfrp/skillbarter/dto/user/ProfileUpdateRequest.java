package com.cts.mfrp.skillbarter.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @NotBlank
    private String name;
    private String bio;
    private String profilePhotoUrl;
    private String languagesSpoken;
    private String email;
}