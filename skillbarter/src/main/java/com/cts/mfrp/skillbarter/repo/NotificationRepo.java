package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Integer> {

    List<Notification> findByUser_UserId(Integer userId);

    List<Notification> findByUser_UserIdAndIsRead(Integer userId, Boolean isRead);
}
