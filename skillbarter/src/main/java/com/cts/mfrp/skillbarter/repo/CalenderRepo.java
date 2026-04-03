package com.cts.repo;

import com.cts.model.Calender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalenderRepo extends JpaRepository<Calender, Integer> {

    List<Calender> findByUser_UserId(Integer userId);

    @Query("SELECT c FROM Calender c WHERE c.user.userId = :userId " +
           "AND c.eventDate BETWEEN :from AND :to ORDER BY c.eventDate ASC")
    List<Calender> findByUserAndDateRange(@Param("userId") Integer userId,
                                          @Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to);

    @Query("SELECT c FROM Calender c WHERE c.user.userId = :userId " +
           "AND c.eventDate >= :now ORDER BY c.eventDate ASC")
    List<Calender> findUpcomingByUser(@Param("userId") Integer userId,
                                      @Param("now") LocalDateTime now);
}