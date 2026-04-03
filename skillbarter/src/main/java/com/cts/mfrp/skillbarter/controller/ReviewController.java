package com.cts.mfrp.skillbarter.controller;

import com.cts.mfrp.skillbarter.model.Review;
import com.cts.mfrp.skillbarter.service.ReviewService;
import com.cts.mfrp.skillbarter.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // POST /api/reviews
    // Body: { "reviewerId": 1, "revieweeId": 2, "rating": 4.5, "reviewText": "Great session!" }
    @PostMapping
    public ResponseEntity<ApiResponse<Review>> addReview(@RequestBody Map<String, Object> request) {
        Integer reviewerId = (Integer) request.get("reviewerId");
        Integer revieweeId = (Integer) request.get("revieweeId");
        BigDecimal rating = new BigDecimal(request.get("rating").toString());
        String reviewText = (String) request.get("reviewText");
        Review review = reviewService.addReview(reviewerId, revieweeId, rating, reviewText);
        return ResponseEntity.ok(ApiResponse.success("Review added successfully", review));
    }

    // GET /api/reviews/reviewee/{revieweeId}
    @GetMapping("/reviewee/{revieweeId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByReviewee(@PathVariable Integer revieweeId) {
        List<Review> reviews = reviewService.getReviewsByReviewee(revieweeId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    // GET /api/reviews/reviewer/{reviewerId}
    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByReviewer(@PathVariable Integer reviewerId) {
        List<Review> reviews = reviewService.getReviewsByReviewer(reviewerId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    // GET /api/reviews/{reviewId}
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Review>> getReviewById(@PathVariable Integer reviewId) {
        return reviewService.getReviewById(reviewId)
                .map(r -> ResponseEntity.ok(ApiResponse.success(r)))
                .orElse(ResponseEntity.ok(ApiResponse.error("Review not found")));
    }

    // GET /api/reviews/reviewee/{revieweeId}/average
    @GetMapping("/reviewee/{revieweeId}/average")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Integer revieweeId) {
        Double avg = reviewService.getAverageRating(revieweeId);
        return ResponseEntity.ok(ApiResponse.success("Average rating fetched", avg));
    }

    // DELETE /api/reviews/{reviewId}
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
}
