package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Review;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.ReviewRepo;
import com.cts.mfrp.skillbarter.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepo reviewRepo;

    @Autowired
    private UserRepo userRepo;

    public Review addReview(Integer reviewerId, Integer revieweeId, BigDecimal rating, String reviewText) {
        if (reviewerId.equals(revieweeId)) {
            throw new RuntimeException("A user cannot review themselves");
        }
        User reviewer = userRepo.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with id: " + reviewerId));
        User reviewee = userRepo.findById(revieweeId)
                .orElseThrow(() -> new RuntimeException("Reviewee not found with id: " + revieweeId));

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(rating);
        review.setReviewText(reviewText);
        return reviewRepo.save(review);
    }

    public List<Review> getReviewsByReviewee(Integer revieweeId) {
        return reviewRepo.findByReviewee_UserId(revieweeId);
    }

    public List<Review> getReviewsByReviewer(Integer reviewerId) {
        return reviewRepo.findByReviewer_UserId(reviewerId);
    }

    public Optional<Review> getReviewById(Integer reviewId) {
        return reviewRepo.findById(reviewId);
    }

    public Double getAverageRating(Integer revieweeId) {
        return reviewRepo.findAverageRatingByRevieweeId(revieweeId);
    }

    public void deleteReview(Integer reviewId) {
        if (!reviewRepo.existsById(reviewId)) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }
        reviewRepo.deleteById(reviewId);
    }
}
