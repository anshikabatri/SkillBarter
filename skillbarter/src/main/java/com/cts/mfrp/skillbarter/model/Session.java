package com.cts.mfrp.skillbarter.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userSkills", "messages"})
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userSkills", "messages"})
    private User learner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Skill skill;

    @NotNull(message = "Scheduled time is required")
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('Scheduled','Completed','Cancelled') DEFAULT 'Scheduled'")
    @Builder.Default
    private SessionStatus status = SessionStatus.Scheduled;

    public enum SessionStatus {
        Scheduled, Completed, Cancelled
    }
}