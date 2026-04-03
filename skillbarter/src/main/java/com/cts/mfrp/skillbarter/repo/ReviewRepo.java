package com.cts.repo;

import com.cts.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Integer> {

    List<Review> findByReviewee_UserId(Integer revieweeId);

    List<Review> findByReviewer_UserId(Integer reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.userId = :revieweeId")
    Double findAverageRatingByRevieweeId(Integer revieweeId);
}
