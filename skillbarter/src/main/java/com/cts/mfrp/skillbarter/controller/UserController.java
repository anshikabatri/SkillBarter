package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // GET /api/users
    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    // GET /api/users/search?name=john
    @GetMapping("/search")
    public ResponseEntity<List<User>> search(@RequestParam String name) {
        return ResponseEntity.ok(userService.searchByName(name));
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(
            @PathVariable Integer id,
            @Valid @RequestBody ProfileUpdateRequest req) {
        User updated = new User();
        updated.setName(req.getName());
        updated.setBio(req.getBio());
        updated.setProfilePhotoUrl(req.getProfilePhotoUrl());
        updated.setLanguagesSpoken(req.getLanguagesSpoken());
        return ResponseEntity.ok(userService.updateProfile(id, updated));
    }

    // PATCH /api/users/{id}/password
    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable Integer id,
            @RequestBody PasswordRequest req) {
        userService.updatePassword(id, req.getPassword());
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/users/{id}/xp?points=50
    @PatchMapping("/{id}/xp")
    public ResponseEntity<User> addXp(
            @PathVariable Integer id,
            @RequestParam Integer points) {
        return ResponseEntity.ok(userService.addXp(id, points));
    }

    // POST /api/users/{id}/photo (multipart/form-data)
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadPhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfilePhoto(id, file));
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class PasswordRequest {
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ProfileUpdateRequest {
        @NotBlank
        private String name;
        private String bio;
        private String profilePhotoUrl;
        private String languagesSpoken;
        // kept for frontend compatibility; not used in update
        private String email;
    }
}