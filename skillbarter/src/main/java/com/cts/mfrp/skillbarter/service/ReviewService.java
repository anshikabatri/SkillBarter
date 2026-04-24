package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.model.Review;
import com.cts.mfrp.skillbarter.model.Session;
import com.cts.mfrp.skillbarter.model.Session.SessionStatus;
import com.cts.mfrp.skillbarter.model.User;
import com.cts.mfrp.skillbarter.repo.ReviewRepo;
import com.cts.mfrp.skillbarter.repo.SessionRepo;
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

    @Autowired
    private SessionRepo sessionRepo;

    public Review addReview(Integer reviewerId, Integer revieweeId, BigDecimal rating, String reviewText, Integer sessionId) {
        if (reviewerId.equals(revieweeId)) {
            throw new RuntimeException("A user cannot review themselves");
        }
        User reviewer = userRepo.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found with id: " + reviewerId));
        User reviewee = userRepo.findById(revieweeId)
                .orElseThrow(() -> new RuntimeException("Reviewee not found with id: " + revieweeId));

        Review review = new Review();

        if (sessionId != null) {
            Session session = sessionRepo.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

            if (session.getStatus() != SessionStatus.Completed) {
                throw new RuntimeException("Review is allowed only after session completion");
            }

            // requester = learner in current app flow
            Integer requesterId = session.getLearner() != null ? session.getLearner().getUserId() : null;
            Integer otherUserId = session.getMentor() != null ? session.getMentor().getUserId() : null;

            if (requesterId == null || otherUserId == null) {
                throw new RuntimeException("Session users are invalid");
            }

            if (!requesterId.equals(reviewerId)) {
                throw new RuntimeException("Only the requester can submit a review for this session");
            }

            if (!otherUserId.equals(revieweeId)) {
                throw new RuntimeException("Requester can review only the other participant of this session");
            }

            if (reviewRepo.existsBySession_SessionIdAndReviewer_UserId(sessionId, reviewerId)) {
                throw new RuntimeException("Review already submitted for this session");
            }

            review.setSession(session);
        }

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

    public boolean hasReviewerReviewedSession(Integer sessionId, Integer reviewerId) {
        return reviewRepo.existsBySession_SessionIdAndReviewer_UserId(sessionId, reviewerId);
    }

    public void deleteReview(Integer reviewId) {
        if (!reviewRepo.existsById(reviewId)) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }
        reviewRepo.deleteById(reviewId);
    }
}
