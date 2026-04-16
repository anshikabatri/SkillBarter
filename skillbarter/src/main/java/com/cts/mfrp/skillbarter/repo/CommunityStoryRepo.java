package com.cts.mfrp.skillbarter.repo;

import com.cts.mfrp.skillbarter.model.CommunityStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityStoryRepo extends JpaRepository<CommunityStory, Integer> {

    @Query("SELECT s FROM CommunityStory s JOIN FETCH s.user WHERE s.user.userId = :userId ORDER BY s.createdAt DESC")
    List<CommunityStory> findByUser_UserId(@Param("userId") Integer userId);

    @Query("SELECT s FROM CommunityStory s JOIN FETCH s.user WHERE s.storyId = :id")
    java.util.Optional<CommunityStory> findByIdWithUser(@Param("id") Integer id);

    @Query("SELECT s FROM CommunityStory s JOIN FETCH s.user WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY s.createdAt DESC")
    List<CommunityStory> findByTitleContainingIgnoreCase(@Param("keyword") String keyword);

    @Query("SELECT s FROM CommunityStory s JOIN FETCH s.user ORDER BY s.createdAt DESC")
    List<CommunityStory> findAllOrderByNewest();

    @Query("SELECT s FROM CommunityStory s JOIN FETCH s.user WHERE s.user.userId = :userId ORDER BY s.createdAt DESC")
    List<CommunityStory> findByUserOrderByNewest(@Param("userId") Integer userId);
}