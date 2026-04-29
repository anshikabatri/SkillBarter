package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.dto.request.user.PasswordRequest;
import com.cts.mfrp.skillbarter.dto.request.user.ProfileUpdateRequest;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> search(@RequestParam String name) {
        return ResponseEntity.ok(userService.searchByName(name));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(
            @PathVariable Integer id,
            @Valid @RequestBody ProfileUpdateRequest request) {
        User updated = new User();
        updated.setName(request.name());
        updated.setBio(request.bio());
        updated.setProfilePhotoUrl(request.profilePhotoUrl());
        updated.setLanguagesSpoken(request.languagesSpoken());
        return ResponseEntity.ok(userService.updateProfile(id, updated));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable Integer id,
            @Valid @RequestBody PasswordRequest request) {
        userService.updatePassword(id, request.password());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/xp")
    public ResponseEntity<User> addXp(
            @PathVariable Integer id,
            @RequestParam Integer points) {
        return ResponseEntity.ok(userService.addXp(id, points));
    }

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadPhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfilePhoto(id, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}