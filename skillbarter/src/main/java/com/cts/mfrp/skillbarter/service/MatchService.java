package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Match;
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
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Arrays;
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
            return refreshScore(existing.get(0));
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

    @Transactional
    public List<Match> getAllMatchesByUser(Integer userId) {
        List<Match> matches = matchRepo.findAllMatchesByUser(userId);
        for (Match match : matches) {
            refreshScore(match);
        }
        return matches;
    }

    @Transactional
    public List<Match> getMatchBetweenUsers(Integer u1, Integer u2) {
        List<Match> matches = matchRepo.findMatchBetweenUsers(u1, u2);
        for (Match match : matches) {
            refreshScore(match);
        }
        return matches;
    }

    @Transactional
    public List<Match> getAllOrderedByScore() {
        List<Match> matches = matchRepo.findAllOrderByScoreDesc();
        for (Match match : matches) {
            refreshScore(match);
        }
        matches.sort(Comparator.comparing(Match::getMatchScore,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return matches;
    }

    public List<MatchSuggestionDto> getSuggestions(Integer userId) {
        User me = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<User> allUsers = userRepo.findAll();
        List<MatchSuggestionDto> out = new ArrayList<>();

        for (User other : allUsers) {
            if (other.getUserId().equals(me.getUserId())) continue;

            List<Match> existing = matchRepo.findMatchBetweenUsers(me.getUserId(), other.getUserId());
            boolean alreadyMatched = !existing.isEmpty();
            BigDecimal score;
            if (alreadyMatched) {
                Match existingMatch = refreshScore(existing.get(0));
                score = existingMatch.getMatchScore();
            } else {
                score = calculateMatchScore(me.getUserId(), other.getUserId());
            }

            out.add(new MatchSuggestionDto(other, score != null ? score : BigDecimal.ZERO, alreadyMatched));
        }

        out.sort((a, b) -> b.getScore().compareTo(a.getScore()));
        return out;
    }

    private BigDecimal calculateMatchScore(Integer u1, Integer u2) {
        List<UserSkill> a = userSkillRepo.findByUserId(u1);
        List<UserSkill> b = userSkillRepo.findByUserId(u2);
        User user1 = userRepo.findById(u1).orElse(null);
        User user2 = userRepo.findById(u2).orElse(null);

        Set<Integer> aTeach = extractSkillIds(a, true, false);
        Set<Integer> aLearn = extractSkillIds(a, false, true);
        Set<Integer> bTeach = extractSkillIds(b, true, false);
        Set<Integer> bLearn = extractSkillIds(b, false, true);
        Set<String> aCategories = extractCategories(a);
        Set<String> bCategories = extractCategories(b);
        Set<String> aLanguages = extractDelimitedValues(user1 != null ? user1.getLanguagesSpoken() : null);
        Set<String> bLanguages = extractDelimitedValues(user2 != null ? user2.getLanguagesSpoken() : null);
        Set<String> aProfileTerms = extractProfileTerms(user1);
        Set<String> bProfileTerms = extractProfileTerms(user2);

        int u1NeedsMetByU2 = intersectionCount(aLearn, bTeach);
        int u2NeedsMetByU1 = intersectionCount(bLearn, aTeach);
        int totalNeeds = aLearn.size() + bLearn.size();
        int categoryOverlap = intersectionCount(aCategories, bCategories);
        int languageOverlap = intersectionCount(aLanguages, bLanguages);
        int categoryBase = Math.max(aCategories.size(), bCategories.size());
        int languageBase = Math.max(aLanguages.size(), bLanguages.size());
        int profileOverlap = intersectionCount(aProfileTerms, bProfileTerms);
        int profileBase = Math.max(aProfileTerms.size(), bProfileTerms.size());

        if (totalNeeds == 0) {
            int sharedTeachingAbility = intersectionCount(aTeach, bTeach);
            int sharedLearningInterest = intersectionCount(aLearn, bLearn);
            int fallbackPool = aTeach.size() + aLearn.size() + bTeach.size() + bLearn.size();
            double fallbackExact = fallbackPool > 0
                    ? (sharedTeachingAbility + sharedLearningInterest) / (double) fallbackPool
                    : 0.0;
            double fallbackCategory = categoryBase > 0 ? categoryOverlap / (double) categoryBase : 0.0;
            double fallbackLanguage = languageBase > 0 ? languageOverlap / (double) languageBase : 0.0;
                double fallbackProfile = profileBase > 0 ? profileOverlap / (double) profileBase : 0.0;
                double fallbackScore = (fallbackExact * 0.45) + (fallbackCategory * 0.2) + (fallbackLanguage * 0.1) + (fallbackProfile * 0.25);
            return BigDecimal.valueOf(Math.min(100.0, Math.max(0.0, fallbackScore * 100.0))).setScale(2, RoundingMode.HALF_UP);
        }

        double reciprocalFit = (u1NeedsMetByU2 + u2NeedsMetByU1) / (double) totalNeeds;
        double coverageBonus = 0.0;
        if (aLearn.size() > 0) {
            coverageBonus += (u1NeedsMetByU2 / (double) aLearn.size()) * 0.2;
        }
        if (bLearn.size() > 0) {
            coverageBonus += (u2NeedsMetByU1 / (double) bLearn.size()) * 0.2;
        }
        double categoryBonus = categoryBase > 0 ? (categoryOverlap / (double) categoryBase) * 0.15 : 0.0;
        double languageBonus = languageBase > 0 ? (languageOverlap / (double) languageBase) * 0.05 : 0.0;
        double profileBonus = profileBase > 0 ? (profileOverlap / (double) profileBase) * 0.1 : 0.0;

        double pct = Math.min(100.0, Math.max(0.0, (reciprocalFit * 0.62 + coverageBonus + categoryBonus + languageBonus + profileBonus) * 100.0));
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

    private int intersectionCount(Set<?> a, Set<?> b) {
        int count = 0;
        for (Object x : a) {
            if (b.contains(x)) count++;
        }
        return count;
    }

    private Set<String> extractCategories(List<UserSkill> list) {
        Set<String> out = new HashSet<>();
        for (UserSkill us : list) {
            if (us.getSkill() == null || us.getSkill().getCategory() == null) continue;
            String name = us.getSkill().getCategory().getName();
            if (name != null && !name.trim().isEmpty()) {
                out.add(name.trim().toLowerCase(Locale.ROOT));
            }
        }
        return out;
    }

    private Set<String> extractDelimitedValues(String raw) {
        Set<String> out = new HashSet<>();
        if (raw == null || raw.trim().isEmpty()) return out;
        for (String value : raw.split("[,]")) {
            String cleaned = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
            if (!cleaned.isEmpty()) {
                out.add(cleaned);
            }
        }
        return out;
    }

    private Set<String> extractProfileTerms(User user) {
        Set<String> out = new HashSet<>();
        if (user == null) return out;

        List<String> sourceTexts = Arrays.asList(user.getName(), user.getBio());
        Set<String> stopWords = new HashSet<>(Arrays.asList(
                "the", "and", "or", "to", "a", "an", "of", "in", "for", "with", "on", "at", "by", "i", "im", "am", "is", "are", "be", "looking", "learn", "learning", "developer", "trainer", "mentor", "person"
        ));

        for (String text : sourceTexts) {
            if (text == null || text.trim().isEmpty()) continue;
            String normalized = text.toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9+ ]", " ")
                    .replaceAll("\s+", " ")
                    .trim();
            if (normalized.isEmpty()) continue;
            for (String token : normalized.split(" ")) {
                if (token.length() < 3) continue;
                if (stopWords.contains(token)) continue;
                out.add(token);
            }
        }

        return out;
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

    private Match refreshScore(Match match) {
        if (match == null || match.getUser1() == null || match.getUser2() == null) {
            return match;
        }
        BigDecimal recalculated = calculateMatchScore(match.getUser1().getUserId(), match.getUser2().getUserId());
        if (match.getMatchScore() == null || match.getMatchScore().compareTo(recalculated) != 0) {
            match.setMatchScore(recalculated);
            return matchRepo.save(match);
        }
        return match;
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