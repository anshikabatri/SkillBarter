package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Session;
import com.cts.mfrp.skillbarter.model.Session.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepo extends JpaRepository<Session, Integer> {

    List<Session> findByMentor_UserId(Integer mentorId);

    List<Session> findByLearner_UserId(Integer learnerId);

    List<Session> findByMentor_UserIdAndStatus(Integer mentorId, SessionStatus status);

    List<Session> findByLearner_UserIdAndStatus(Integer learnerId, SessionStatus status);

    @Query("SELECT s FROM Session s WHERE (s.mentor.userId = :userId OR s.learner.userId = :userId) " +
           "AND s.scheduledAt BETWEEN :from AND :to")
    List<Session> findByUserAndDateRange(@Param("userId") Integer userId,
                                         @Param("from") LocalDateTime from,
                                         @Param("to") LocalDateTime to);

    @Query("SELECT s FROM Session s WHERE s.skill.skillId = :skillId AND s.status = :status")
    List<Session> findBySkillAndStatus(@Param("skillId") Integer skillId,
                                       @Param("status") SessionStatus status);
}