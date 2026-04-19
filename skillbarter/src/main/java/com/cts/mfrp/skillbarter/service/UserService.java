package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public User getById(Integer id) {
        return findOrThrow(id);
    }

    @Transactional(readOnly = true)
    public List<User> getAll() {
        return userRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<User> searchByName(String name) {
        return userRepo.findByNameContainingIgnoreCase(name);
    }

    public User updateProfile(Integer id, User updated) {
        User user = findOrThrow(id);
        if (updated.getName() != null && !updated.getName().isBlank()) {
            user.setName(updated.getName());
        }
        if (updated.getBio() != null) {
            user.setBio(updated.getBio());
        }
        if (updated.getProfilePhotoUrl() != null) {
            user.setProfilePhotoUrl(updated.getProfilePhotoUrl());
        }
        if (updated.getLanguagesSpoken() != null) {
            user.setLanguagesSpoken(updated.getLanguagesSpoken());
        }
        return userRepo.save(user);
    }

    public User updatePassword(Integer id, String newRawPassword) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(newRawPassword));
        return userRepo.save(user);
    }

    public User updateProfilePhoto(Integer id, MultipartFile file) {
        User user = findOrThrow(id);

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an image file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        long maxSizeBytes = 5L * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new RuntimeException("Image size should be less than 5MB");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String fileName = "user-" + id + "-" + UUID.randomUUID() + extension;
            Path target = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            user.setProfilePhotoUrl("/uploads/" + fileName);
            return userRepo.save(user);
        } catch (IOException ex) {
            throw new RuntimeException("Unable to upload profile image", ex);
        }
    }

    public User addXp(Integer id, Integer points) {
        User user = findOrThrow(id);
        user.setXp(user.getXp() + points);
        return userRepo.save(user);
    }

    public void deleteUser(Integer id) {
        if (!userRepo.existsById(id))
            throw new RuntimeException("User not found: " + id);
        userRepo.deleteById(id);
    }

    private User findOrThrow(Integer id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
}