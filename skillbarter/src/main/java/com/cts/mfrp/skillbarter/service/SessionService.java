package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Session;
import com.cts.mfrp.skillbarter.model.Session.SessionStatus;
import com.cts.mfrp.skillbarter.model.Skill;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.model.Notification;
import com.cts.mfrp.skillbarter.repo.SessionRepo;
import com.cts.mfrp.skillbarter.repo.SkillRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private static final int COMPLETION_XP = 50;

    private final SessionRepo sessionRepo;
    private final UserRepo userRepo;
    private final SkillRepo skillRepo;
    private final NotificationService notificationService;

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
        Session saved = sessionRepo.save(session);

        try {
            notificationService.createNotification(
                    mentor.getUserId(),
                    Notification.NotificationType.Session,
                    "New session request from " + learner.getName() + " for " + skill.getName() +
                            " on " + saved.getScheduledAt()
            );
        } catch (Exception ignored) {
        }

        return saved;
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
        SessionStatus previousStatus = session.getStatus();
        session.setStatus(status);

        // Award XP only once per session when it first moves to Completed
        if (status == SessionStatus.Completed && previousStatus != SessionStatus.Completed) {
            User mentor = session.getMentor();
            User learner = session.getLearner();

            mentor.setXp((mentor.getXp() == null ? 0 : mentor.getXp()) + COMPLETION_XP);
            learner.setXp((learner.getXp() == null ? 0 : learner.getXp()) + COMPLETION_XP);

            userRepo.save(mentor);
            userRepo.save(learner);

            try {
                String skillName = session.getSkill() != null ? session.getSkill().getName() : "session";
                notificationService.createNotification(
                        mentor.getUserId(),
                        Notification.NotificationType.Session,
                        "Session marked completed for " + skillName + ". You earned " + COMPLETION_XP + " XP."
                );
                notificationService.createNotification(
                        learner.getUserId(),
                        Notification.NotificationType.Session,
                        "Session marked completed for " + skillName + ". You earned " + COMPLETION_XP + " XP."
                );
            } catch (Exception ignored) {
            }
        }

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