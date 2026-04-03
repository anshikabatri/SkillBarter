package com.cts.controller;

import com.cts.model.Calender;
import com.cts.service.CalenderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalenderController {

    private final CalenderService calenderService;

    // POST /api/calendar
    // Body: { "user": {"userId": 1}, "eventDate": "2025-10-01T10:00:00", "description": "Guitar lesson" }
    @PostMapping
    public ResponseEntity<Calender> createEvent(@Valid @RequestBody Calender event) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calenderService.createEvent(event));
    }

    // GET /api/calendar/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Calender> getEvent(@PathVariable Integer id) {
        return ResponseEntity.ok(calenderService.getEventById(id));
    }

    // GET /api/calendar/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Calender>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(calenderService.getEventsByUser(userId));
    }

    // GET /api/calendar/user/{userId}/upcoming
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<List<Calender>> getUpcoming(@PathVariable Integer userId) {
        return ResponseEntity.ok(calenderService.getUpcomingEvents(userId));
    }

    // GET /api/calendar/user/{userId}/range?from=...&to=...
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<Calender>> getByRange(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(calenderService.getEventsByUserAndDateRange(userId, from, to));
    }

    // PUT /api/calendar/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Calender> updateEvent(
            @PathVariable Integer id,
            @Valid @RequestBody Calender event) {
        return ResponseEntity.ok(calenderService.updateEvent(id, event));
    }

    // DELETE /api/calendar/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        calenderService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}