package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepo extends JpaRepository<Match, Integer> {

    @Query("SELECT m FROM Match m JOIN FETCH m.user1 JOIN FETCH m.user2 WHERE m.user1.userId = :userId OR m.user2.userId = :userId")
    List<Match> findAllMatchesByUser(@Param("userId") Integer userId);

    @Query("SELECT m FROM Match m JOIN FETCH m.user1 JOIN FETCH m.user2 WHERE (m.user1.userId = :u1 AND m.user2.userId = :u2) " +
            "OR (m.user1.userId = :u2 AND m.user2.userId = :u1)")
    List<Match> findMatchBetweenUsers(@Param("u1") Integer u1, @Param("u2") Integer u2);

    @Query("SELECT m FROM Match m JOIN FETCH m.user1 JOIN FETCH m.user2 ORDER BY m.matchScore DESC")
    List<Match> findAllOrderByScoreDesc();
}