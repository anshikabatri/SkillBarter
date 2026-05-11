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

    @PostMapping
    public ResponseEntity<Match> create(@Valid @RequestBody Match match) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchService.createMatch(match));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(matchService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Match>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(matchService.getAllMatchesByUser(userId));
    }

    @GetMapping("/between")
    public ResponseEntity<List<Match>> getBetweenUsers(
            @RequestParam Integer u1,
            @RequestParam Integer u2) {
        return ResponseEntity.ok(matchService.getMatchBetweenUsers(u1, u2));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Match>> getLeaderboard() {
        return ResponseEntity.ok(matchService.getAllOrderedByScore());
    }

    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<List<MatchService.MatchSuggestionDto>> getSuggestions(@PathVariable Integer userId) {
        return ResponseEntity.ok(matchService.getSuggestions(userId));
    }

    @PatchMapping("/{id}/score")
    public ResponseEntity<Match> updateScore(
            @PathVariable Integer id,
            @RequestParam BigDecimal score) {
        return ResponseEntity.ok(matchService.updateMatchScore(id, score));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }
}