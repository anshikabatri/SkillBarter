package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.Session;
import com.cts.mfrp.skillbarter.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<Session> createSession(@Valid @RequestBody Session session) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(session));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable Integer id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<Session>> getByMentor(@PathVariable Integer mentorId) {
        return ResponseEntity.ok(sessionService.getSessionsByMentor(mentorId));
    }

    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<Session>> getByLearner(@PathVariable Integer learnerId) {
        return ResponseEntity.ok(sessionService.getSessionsByLearner(learnerId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Session>> getByUserAndRange(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(sessionService.getSessionsByUserAndDateRange(userId, from, to));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Session> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        return ResponseEntity.ok(sessionService.updateSessionStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Integer id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}