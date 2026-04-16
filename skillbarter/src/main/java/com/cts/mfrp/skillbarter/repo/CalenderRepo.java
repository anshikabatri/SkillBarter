package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Calender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalenderRepo extends JpaRepository<Calender, Integer> {

    @Query("SELECT c FROM Calender c JOIN FETCH c.user WHERE c.user.userId = :userId")
    List<Calender> findByUser_UserId(@Param("userId") Integer userId);

    @Query("SELECT c FROM Calender c JOIN FETCH c.user WHERE c.user.userId = :userId " +
           "AND c.eventDate BETWEEN :from AND :to ORDER BY c.eventDate ASC")
    List<Calender> findByUserAndDateRange(@Param("userId") Integer userId,
                                          @Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to);

    @Query("SELECT c FROM Calender c JOIN FETCH c.user WHERE c.user.userId = :userId " +
           "AND c.eventDate >= :now ORDER BY c.eventDate ASC")
    List<Calender> findUpcomingByUser(@Param("userId") Integer userId,
                                      @Param("now") LocalDateTime now);
}