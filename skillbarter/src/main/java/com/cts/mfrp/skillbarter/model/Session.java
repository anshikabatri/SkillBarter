package com.cts.mfrp.skillbarter.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "bio", "profilePhotoUrl", "languagesSpoken", "createdAt", "hibernateLazyInitializer", "handler"})
    private User mentor;

    @ManyToOne
    @JoinColumn(name = "learner_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "bio", "profilePhotoUrl", "languagesSpoken", "createdAt", "hibernateLazyInitializer", "handler"})
    private User learner;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private SessionStatus status = SessionStatus.Scheduled;

    public enum SessionStatus {
        Scheduled, Completed, Cancelled
    }

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }

    public User getLearner() { return learner; }
    public void setLearner(User learner) { this.learner = learner; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
}