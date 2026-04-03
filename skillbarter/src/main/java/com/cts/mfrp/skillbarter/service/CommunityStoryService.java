package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.CommunityStory;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.CommunityStoryRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityStoryService {

    private final CommunityStoryRepo storyRepo;
    private final UserRepo userRepo;

    public CommunityStory createStory(CommunityStory story) {
        User user = userRepo.findById(story.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        story.setUser(user);
        return storyRepo.save(story);
    }

    @Transactional(readOnly = true)
    public CommunityStory getById(Integer id) {
        return findOrThrow(id);
    }

    @Transactional(readOnly = true)
    public List<CommunityStory> getAllNewest() {
        return storyRepo.findAllOrderByNewest();
    }

    @Transactional(readOnly = true)
    public List<CommunityStory> getByUser(Integer userId) {
        return storyRepo.findByUserOrderByNewest(userId);
    }

    @Transactional(readOnly = true)
    public List<CommunityStory> searchByTitle(String keyword) {
        return storyRepo.findByTitleContainingIgnoreCase(keyword);
    }

    public CommunityStory updateStory(Integer id, CommunityStory updated) {
        CommunityStory story = findOrThrow(id);
        story.setTitle(updated.getTitle());
        story.setContent(updated.getContent());
        story.setMediaUrl(updated.getMediaUrl());
        return storyRepo.save(story);
    }

    public void deleteStory(Integer id) {
        if (!storyRepo.existsById(id))
            throw new RuntimeException("Story not found: " + id);
        storyRepo.deleteById(id);
    }

    private CommunityStory findOrThrow(Integer id) {
        return storyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Story not found: " + id));
    }
}