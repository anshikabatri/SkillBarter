package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Match;
import com.cts.mfrp.skillbarter.model.Skill;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.model.UserSkill;
import com.cts.mfrp.skillbarter.repo.MatchRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import com.cts.mfrp.skillbarter.repo.UserSkillRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class MatchService {

    private final MatchRepo matchRepo;
    private final UserRepo userRepo;
    private final UserSkillRepo userSkillRepo;

    public Match createMatch(Match match) {
        User user1 = userRepo.findById(match.getUser1().getUserId())
                .orElseThrow(() -> new RuntimeException("User1 not found"));
        User user2 = userRepo.findById(match.getUser2().getUserId())
                .orElseThrow(() -> new RuntimeException("User2 not found"));

        if (user1.getUserId().equals(user2.getUserId())) {
            throw new RuntimeException("Cannot create match with same user");
        }

        List<Match> existing = matchRepo.findMatchBetweenUsers(user1.getUserId(), user2.getUserId());
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        BigDecimal score = calculateMatchScore(user1.getUserId(), user2.getUserId());
        match.setUser1(user1);
        match.setUser2(user2);
        match.setMatchScore(score);
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

    @Transactional(readOnly = true)
    public List<MatchSuggestionDto> getSuggestions(Integer userId) {
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<User> allUsers = userRepo.findAll();
        List<MatchSuggestionDto> out = new ArrayList<>();

        for (User other : allUsers) {
            if (other.getUserId().equals(me.getUserId())) continue;

            List<Match> existing = matchRepo.findMatchBetweenUsers(me.getUserId(), other.getUserId());
            boolean alreadyMatched = !existing.isEmpty();
            BigDecimal score = alreadyMatched
                    ? existing.get(0).getMatchScore()
                    : calculateMatchScore(me.getUserId(), other.getUserId());

            out.add(new MatchSuggestionDto(other, score != null ? score : BigDecimal.ZERO, alreadyMatched));
        }

        out.sort((a, b) -> b.getScore().compareTo(a.getScore()));
        return out;
    }

    private BigDecimal calculateMatchScore(Integer u1, Integer u2) {
        List<UserSkill> a = userSkillRepo.findByUserId(u1);
        List<UserSkill> b = userSkillRepo.findByUserId(u2);

        Set<Integer> aTeach = extractSkillIds(a, true, false);
        Set<Integer> aLearn = extractSkillIds(a, false, true);
        Set<Integer> bTeach = extractSkillIds(b, true, false);
        Set<Integer> bLearn = extractSkillIds(b, false, true);

        int reciprocal = intersectionCount(aTeach, bLearn) + intersectionCount(aLearn, bTeach);
        int oneWay = intersectionCount(aTeach, bTeach) + intersectionCount(aLearn, bLearn);

        int basePool = aTeach.size() + aLearn.size() + bTeach.size() + bLearn.size();
        if (basePool == 0) return BigDecimal.ZERO;

        double weighted = (reciprocal * 2.0 + oneWay * 0.5) / basePool;
        double pct = Math.min(100.0, Math.max(0.0, weighted * 100.0));
        return BigDecimal.valueOf(pct).setScale(2, RoundingMode.HALF_UP);
    }

    private Set<Integer> extractSkillIds(List<UserSkill> list, boolean teach, boolean learn) {
        Set<Integer> out = new HashSet<>();
        for (UserSkill us : list) {
            if (us.getSkill() == null || us.getSkill().getSkillId() == null) continue;
            if (teach && Boolean.TRUE.equals(us.getIsTeach())) out.add(us.getSkill().getSkillId());
            if (learn && Boolean.TRUE.equals(us.getIsLearn())) out.add(us.getSkill().getSkillId());
        }
        return out;
    }

    private int intersectionCount(Set<Integer> a, Set<Integer> b) {
        int count = 0;
        for (Integer x : a) {
            if (b.contains(x)) count++;
        }
        return count;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class MatchSuggestionDto {
        private User user;
        private BigDecimal score;
        private boolean alreadyMatched;
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