package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Match;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.MatchRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepo matchRepo;
    private final UserRepo userRepo;

    public Match createMatch(Match match) {
        User user1 = userRepo.findById(match.getUser1().getUserId())
                .orElseThrow(() -> new RuntimeException("User1 not found"));
        User user2 = userRepo.findById(match.getUser2().getUserId())
                .orElseThrow(() -> new RuntimeException("User2 not found"));
        match.setUser1(user1);
        match.setUser2(user2);
        return matchRepo.save(match);
    }

    @Transactional(readOnly = true)
    public Match getById(Integer id) {
        return findOrThrow(id);
    }

    @Transactional(readOnly = true)
    public List<Match> getAllMatchesByUser(Integer userId) {
        return matchRepo.findAllMatchesByUser(userId);
    }

    @Transactional(readOnly = true)
    public List<Match> getMatchBetweenUsers(Integer u1, Integer u2) {
        return matchRepo.findMatchBetweenUsers(u1, u2);
    }

    @Transactional(readOnly = true)
    public List<Match> getAllOrderedByScore() {
        return matchRepo.findAllOrderByScoreDesc();
    }

    public Match updateMatchScore(Integer id, java.math.BigDecimal score) {
        Match match = findOrThrow(id);
        match.setMatchScore(score);
        return matchRepo.save(match);
    }

    public void deleteMatch(Integer id) {
        if (!matchRepo.existsById(id))
            throw new RuntimeException("Match not found: " + id);
        matchRepo.deleteById(id);
    }

    private Match findOrThrow(Integer id) {
        return matchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found: " + id));
    }
}