package com.cts.mfrp.skillbarter.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Integer messageId;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties({"mentor", "learner", "skill", "hibernateLazyInitializer", "handler"})
    private Session session;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "bio", "profilePhotoUrl", "languagesSpoken", "createdAt", "hibernateLazyInitializer", "handler"})
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }

    public Message() {}

    public Message(Integer messageId, Session session, User sender, String content, LocalDateTime sentAt) {
        this.messageId = messageId;
        this.session = session;
        this.sender = sender;
        this.content = content;
        this.sentAt = sentAt;
    }

    public Integer getMessageId() { return messageId; }
    public void setMessageId(Integer messageId) { this.messageId = messageId; }

    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
