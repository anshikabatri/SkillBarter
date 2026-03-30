package com.cts.controller;

import com.cts.model.CommunityStory;
import com.cts.service.CommunityStoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class CommunityStoryController {

    private final CommunityStoryService storyService;

    // POST /api/stories
    // Body: { "user": {"userId": 1}, "title": "My journey", "content": "...", "mediaUrl": "https://..." }
    @PostMapping
    public ResponseEntity<CommunityStory> create(@Valid @RequestBody CommunityStory story) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storyService.createStory(story));
    }

    // GET /api/stories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CommunityStory> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(storyService.getById(id));
    }

    // GET /api/stories
    @GetMapping
    public ResponseEntity<List<CommunityStory>> getAll() {
        return ResponseEntity.ok(storyService.getAllNewest());
    }

    // GET /api/stories/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommunityStory>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(storyService.getByUser(userId));
    }

    // GET /api/stories/search?keyword=guitar
    @GetMapping("/search")
    public ResponseEntity<List<CommunityStory>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(storyService.searchByTitle(keyword));
    }

    // PUT /api/stories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<CommunityStory> update(
            @PathVariable Integer id,
            @Valid @RequestBody CommunityStory story) {
        return ResponseEntity.ok(storyService.updateStory(id, story));
    }

    // DELETE /api/stories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        storyService.deleteStory(id);
        return ResponseEntity.noContent().build();
    }
}