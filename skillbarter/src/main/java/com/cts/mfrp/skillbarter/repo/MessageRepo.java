package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message, Integer> {

    List<Message> findBySession_SessionId(Integer sessionId);

    List<Message> findBySender_UserId(Integer senderId);
}
