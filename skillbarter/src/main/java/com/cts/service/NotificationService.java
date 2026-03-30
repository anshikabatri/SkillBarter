package com.cts.service;

import com.cts.model.Notification;
import com.cts.model.User;
import com.cts.repo.NotificationRepo;
import com.cts.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserRepo userRepo;

    public Notification createNotification(Integer userId, Notification.NotificationType type, String content) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setContent(content);
        notification.setIsRead(false);
        return notificationRepo.save(notification);
    }

    public List<Notification> getNotificationsByUser(Integer userId) {
        return notificationRepo.findByUser_UserId(userId);
    }

    public List<Notification> getUnreadNotificationsByUser(Integer userId) {
        return notificationRepo.findByUser_UserIdAndIsRead(userId, false);
    }

    public Notification markAsRead(Integer notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notification.setIsRead(true);
        return notificationRepo.save(notification);
    }

    public void markAllAsRead(Integer userId) {
        List<Notification> unread = notificationRepo.findByUser_UserIdAndIsRead(userId, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepo.saveAll(unread);
    }

    public void deleteNotification(Integer notificationId) {
        if (!notificationRepo.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with id: " + notificationId);
        }
        notificationRepo.deleteById(notificationId);
    }
}
