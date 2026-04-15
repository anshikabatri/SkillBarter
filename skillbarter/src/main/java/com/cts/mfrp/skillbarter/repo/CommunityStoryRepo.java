package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.CommunityStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityStoryRepo extends JpaRepository<CommunityStory, Integer> {

    List<CommunityStory> findByUser_UserId(Integer userId);

    List<CommunityStory> findByTitleContainingIgnoreCase(String keyword);

    @Query("SELECT s FROM CommunityStory s ORDER BY s.createdAt DESC")
    List<CommunityStory> findAllOrderByNewest();

    @Query("SELECT s FROM CommunityStory s WHERE s.user.userId = :userId ORDER BY s.createdAt DESC")
    List<CommunityStory> findByUserOrderByNewest(@Param("userId") Integer userId);
}