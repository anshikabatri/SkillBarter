package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Message;
import com.cts.mfrp.skillbarter.model.Session;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.MessageRepo;
import com.cts.mfrp.skillbarter.repo.SessionRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepo messageRepo;

    @Autowired
    private SessionRepo sessionRepo;

    @Autowired
    private UserRepo userRepo;

    public Message sendMessage(Integer sessionId, Integer senderId, String content) {
        if (sessionId == null || senderId == null) {
            throw new RuntimeException("sessionId and senderId are required");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
        User sender = userRepo.findById(senderId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + senderId));

        Message message = new Message();
        message.setSession(session);
        message.setSender(sender);
        message.setContent(content.trim());
        return messageRepo.save(message);
    }

    public List<Message> getMessagesBySession(Integer sessionId) {
        return messageRepo.findBySession_SessionId(sessionId);
    }

    public List<Message> getMessagesBySender(Integer senderId) {
        return messageRepo.findBySender_UserId(senderId);
    }

    public Optional<Message> getMessageById(Integer messageId) {
        return messageRepo.findById(messageId);
    }

    public void deleteMessage(Integer messageId) {
        if (!messageRepo.existsById(messageId)) {
            throw new RuntimeException("Message not found with id: " + messageId);
        }
        messageRepo.deleteById(messageId);
    }
}
