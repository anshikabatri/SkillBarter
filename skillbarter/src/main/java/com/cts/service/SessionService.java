package com.cts.service;

import com.cts.model.Session;
import com.cts.model.Session.SessionStatus;
import com.cts.model.Skill;
import com.cts.model.User;
import com.cts.repo.SessionRepo;
import com.cts.repo.SkillRepo;
import com.cts.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepo sessionRepo;
    private final UserRepo userRepo;
    private final SkillRepo skillRepo;

    public Session createSession(Session session) {
        User mentor  = userRepo.findById(session.getMentor().getUserId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        User learner = userRepo.findById(session.getLearner().getUserId())
                .orElseThrow(() -> new RuntimeException("Learner not found"));
        Skill skill  = skillRepo.findById(session.getSkill().getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        session.setMentor(mentor);
        session.setLearner(learner);
        session.setSkill(skill);
        session.setStatus(SessionStatus.Scheduled);
        return sessionRepo.save(session);
    }

    @Transactional(readOnly = true)
    public Session getSessionById(Integer id) {
        return findOrThrow(id);
    }

    @Transactional(readOnly = true)
    public List<Session> getSessionsByMentor(Integer mentorId) {
        return sessionRepo.findByMentor_UserId(mentorId);
    }

    @Transactional(readOnly = true)
    public List<Session> getSessionsByLearner(Integer learnerId) {
        return sessionRepo.findByLearner_UserId(learnerId);
    }

    @Transactional(readOnly = true)
    public List<Session> getSessionsByUserAndDateRange(Integer userId,
                                                        LocalDateTime from,
                                                        LocalDateTime to) {
        return sessionRepo.findByUserAndDateRange(userId, from, to);
    }

    public Session updateSessionStatus(Integer id, SessionStatus status) {
        Session session = findOrThrow(id);
        session.setStatus(status);
        return sessionRepo.save(session);
    }

    public void deleteSession(Integer id) {
        if (!sessionRepo.existsById(id))
            throw new RuntimeException("Session not found: " + id);
        sessionRepo.deleteById(id);
    }

    private Session findOrThrow(Integer id) {
        return sessionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found: " + id));
    }
}