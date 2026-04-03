package com.cts.controller;

import com.cts.model.Session;
import com.cts.model.Session.SessionStatus;
import com.cts.service.SessionService;
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

    // POST /api/sessions
    // Body: { "mentor": {"userId": 1}, "learner": {"userId": 2}, "skill": {"skillId": 3}, "scheduledAt": "2025-10-01T10:00:00" }
    @PostMapping
    public ResponseEntity<Session> createSession(@Valid @RequestBody Session session) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(session));
    }

    // GET /api/sessions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable Integer id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    // GET /api/sessions/mentor/{mentorId}
    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<Session>> getByMentor(@PathVariable Integer mentorId) {
        return ResponseEntity.ok(sessionService.getSessionsByMentor(mentorId));
    }

    // GET /api/sessions/learner/{learnerId}
    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<Session>> getByLearner(@PathVariable Integer learnerId) {
        return ResponseEntity.ok(sessionService.getSessionsByLearner(learnerId));
    }

    // GET /api/sessions/user/{userId}/range?from=...&to=...
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Session>> getByUserAndRange(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(sessionService.getSessionsByUserAndDateRange(userId, from, to));
    }

    // PATCH /api/sessions/{id}/status?status=Completed
    @PatchMapping("/{id}/status")
    public ResponseEntity<Session> updateStatus(
            @PathVariable Integer id,
            @RequestParam SessionStatus status) {
        return ResponseEntity.ok(sessionService.updateSessionStatus(id, status));
    }

    // DELETE /api/sessions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Integer id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}