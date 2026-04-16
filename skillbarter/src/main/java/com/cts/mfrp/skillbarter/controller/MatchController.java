package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.Match;
import com.cts.mfrp.skillbarter.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    // POST /api/matches
    // Body: { "user1": {"userId": 1}, "user2": {"userId": 2}, "matchScore": 87.50 }
    @PostMapping
    public ResponseEntity<Match> create(@Valid @RequestBody Match match) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchService.createMatch(match));
    }

    // GET /api/matches/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Match> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(matchService.getById(id));
    }

    // GET /api/matches/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Match>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(matchService.getAllMatchesByUser(userId));
    }

    // GET /api/matches/between?u1=1&u2=2
    @GetMapping("/between")
    public ResponseEntity<List<Match>> getBetweenUsers(
            @RequestParam Integer u1,
            @RequestParam Integer u2) {
        return ResponseEntity.ok(matchService.getMatchBetweenUsers(u1, u2));
    }

    // GET /api/matches/leaderboard
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Match>> getLeaderboard() {
        return ResponseEntity.ok(matchService.getAllOrderedByScore());
    }

    // GET /api/matches/suggestions/{userId}
    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<List<MatchService.MatchSuggestionDto>> getSuggestions(@PathVariable Integer userId) {
        return ResponseEntity.ok(matchService.getSuggestions(userId));
    }

    // PATCH /api/matches/{id}/score?score=92.00
    @PatchMapping("/{id}/score")
    public ResponseEntity<Match> updateScore(
            @PathVariable Integer id,
            @RequestParam BigDecimal score) {
        return ResponseEntity.ok(matchService.updateMatchScore(id, score));
    }

    // DELETE /api/matches/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }
}