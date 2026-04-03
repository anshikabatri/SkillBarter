package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

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
        user.setName(updated.getName());
        user.setBio(updated.getBio());
        user.setProfilePhotoUrl(updated.getProfilePhotoUrl());
        user.setLanguagesSpoken(updated.getLanguagesSpoken());
        return userRepo.save(user);
    }

    public User updatePassword(Integer id, String newRawPassword) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(newRawPassword));
        return userRepo.save(user);
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