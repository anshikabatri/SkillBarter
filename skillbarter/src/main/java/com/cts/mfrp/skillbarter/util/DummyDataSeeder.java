package com.cts.util;

import com.cts.model.*;
import com.cts.model.Notification.NotificationType;
import com.cts.model.Session.SessionStatus;
import com.cts.model.Transaction.PaymentMethod;
import com.cts.model.Transaction.TransactionStatus;
import com.cts.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DummyDataSeeder implements CommandLineRunner {

    @Value("${app.seed-data:false}")
    private boolean seedData;

    private final UserRepo userRepo;
    private final CategoryRepo categoryRepo;
    private final SkillRepo skillRepo;
    private final UserSkillRepo userSkillRepo;
    private final MatchRepo matchRepo;
    private final SessionRepo sessionRepo;
    private final TransactionRepo transactionRepo;
    private final ReviewRepo reviewRepo;
    private final NotificationRepo notificationRepo;
    private final CommunityStoryRepo communityStoryRepo;
    private final CalenderRepo calenderRepo;
    private final MessageRepo messageRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedData) {
            log.info("Dummy data seed is disabled (app.seed-data=false)");
            return;
        }

        if (userRepo.count() > 0) {
            log.info("Skipping dummy seed because users already exist");
            return;
        }

        // Users
        User u1 = User.builder()
                .name("John Mentor")
                .email("john@mail.com")
                .passwordHash(passwordEncoder.encode("secret123"))
                .bio("Java mentor and backend engineer")
                .languagesSpoken("English,Hindi")
                .profilePhotoUrl("https://example.com/john.jpg")
                .xp(120)
                .build();

        User u2 = User.builder()
                .name("Priya Learner")
                .email("priya@mail.com")
                .passwordHash(passwordEncoder.encode("secret123"))
                .bio("Learning Spring Boot and SQL")
                .languagesSpoken("English,Tamil")
                .profilePhotoUrl("https://example.com/priya.jpg")
                .xp(45)
                .build();

        User u3 = User.builder()
                .name("Arun Fullstack")
                .email("arun@mail.com")
                .passwordHash(passwordEncoder.encode("secret123"))
                .bio("Angular + Java fullstack developer")
                .languagesSpoken("English,Telugu")
                .profilePhotoUrl("https://example.com/arun.jpg")
                .xp(80)
                .build();

        userRepo.save(u1);
        userRepo.save(u2);
        userRepo.save(u3);

        // Categories
        Category c1 = new Category(null, "Programming");
        Category c2 = new Category(null, "Design");
        categoryRepo.save(c1);
        categoryRepo.save(c2);

        // Skills
        Skill s1 = new Skill(null, "Java", c1);
        Skill s2 = new Skill(null, "Spring Boot", c1);
        Skill s3 = new Skill(null, "UI/UX", c2);
        skillRepo.save(s1);
        skillRepo.save(s2);
        skillRepo.save(s3);

        // User skills (teach/learn)
        userSkillRepo.save(new UserSkill(null, u1.getUserId(), s1, true, false));
        userSkillRepo.save(new UserSkill(null, u1.getUserId(), s2, true, false));
        userSkillRepo.save(new UserSkill(null, u2.getUserId(), s1, false, true));
        userSkillRepo.save(new UserSkill(null, u2.getUserId(), s3, true, false));
        userSkillRepo.save(new UserSkill(null, u3.getUserId(), s2, false, true));

        // Match
        Match m1 = Match.builder()
                .user1(u1)
                .user2(u2)
                .matchScore(new BigDecimal("87.50"))
                .build();
        matchRepo.save(m1);

        // Session
        Session session1 = Session.builder()
                .mentor(u1)
                .learner(u2)
                .skill(s2)
                .scheduledAt(LocalDateTime.now().plusDays(2))
                .status(SessionStatus.Scheduled)
                .build();
        sessionRepo.save(session1);

        // Transaction
        Transaction t1 = Transaction.builder()
                .user(u2)
                .session(session1)
                .amount(new BigDecimal("499.00"))
                .paymentMethod(PaymentMethod.UPI)
                .status(TransactionStatus.Success)
                .build();
        transactionRepo.save(t1);

        // Review
        Review review = new Review();
        review.setReviewer(u2);
        review.setReviewee(u1);
        review.setRating(new BigDecimal("4.5"));
        review.setReviewText("Great explanation of Spring concepts.");
        reviewRepo.save(review);

        // Notification
        Notification n1 = new Notification();
        n1.setUser(u1);
        n1.setType(NotificationType.Session);
        n1.setContent("You have a new session scheduled.");
        n1.setIsRead(false);
        notificationRepo.save(n1);

        // Story
        CommunityStory story = CommunityStory.builder()
                .user(u1)
                .title("How SkillBarter helped me mentor")
                .content("I connected with learners and improved my teaching through weekly sessions.")
                .mediaUrl("https://example.com/story.jpg")
                .build();
        communityStoryRepo.save(story);

        // Calendar events
        Calender e1 = Calender.builder()
                .user(u1)
                .eventDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .description("Spring Boot mentoring session")
                .build();
        Calender e2 = Calender.builder()
                .user(u2)
                .eventDate(LocalDateTime.now().plusDays(3).withHour(17).withMinute(30))
                .description("Practice assignment review")
                .build();
        calenderRepo.save(e1);
        calenderRepo.save(e2);

        // Message
        Message msg = new Message();
        msg.setSession(session1);
        msg.setSender(u2);
        msg.setContent("Hi John, looking forward to the session!");
        messageRepo.save(msg);

        log.info("Dummy seed inserted successfully");
    }
}
