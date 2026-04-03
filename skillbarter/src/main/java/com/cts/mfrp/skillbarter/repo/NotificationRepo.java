package com.cts.repo;

import com.cts.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Integer> {

    List<Notification> findByUser_UserId(Integer userId);

    List<Notification> findByUser_UserIdAndIsRead(Integer userId, Boolean isRead);
}
