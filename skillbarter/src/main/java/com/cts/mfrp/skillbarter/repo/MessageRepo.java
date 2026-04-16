package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.session.sessionId = :sessionId ORDER BY m.sentAt ASC")
    List<Message> findBySession_SessionId(@Param("sessionId") Integer sessionId);

    @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.sender.userId = :senderId ORDER BY m.sentAt DESC")
    List<Message> findBySender_UserId(@Param("senderId") Integer senderId);
}
