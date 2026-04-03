# SkillBarter: Concepts & Architecture Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Spring Boot & Framework](#spring-boot--framework)
4. [Security](#security)
5. [Database & ORM](#database--orm)
6. [API Design](#api-design)
7. [Business Logic](#business-logic)
8. [Design Patterns](#design-patterns)
9. [Data Models](#data-models)

---



## Architecture Overview

### Layered Architecture (N-Tier)
SkillBarter uses a **4-layer architecture**:

```
┌─────────────────────────────────┐
│      HTTP Layer (REST)          │  Controllers
├─────────────────────────────────┤
│     Business Logic Layer        │  Services
├─────────────────────────────────┤
│     Data Access Layer (JPA)     │  Repositories
├─────────────────────────────────┤
│      Database (MySQL)           │  Persistence
└─────────────────────────────────┘
```

**Why?**
- **Separation of Concerns**: Each layer has a specific responsibility.
- **Testability**: Layers can be tested independently.
- **Maintainability**: Easy to modify one layer without affecting others.
- **Scalability**: Each layer can scale independently.

---

## Core Concepts

### 1. Spring Boot
**What?** Framework that simplifies Spring application setup and deployment.

**Why?**
- Auto-configuration (no XML config files).
- Embedded Tomcat server (no external app server needed).
- Starter dependencies (easy to add features like Web, Security, JPA).
- Production-ready out of the box.
- Rapid development.

**Usage in SkillBarter:**
```xml
<!-- pom.xml includes starters -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

---

### 2. REST (Representational State Transfer)
**What?** Architectural style for building web APIs using HTTP methods on resource URIs.

**Why?**
- Stateless: No client context stored on server.
- Scalable: Each request is independent.
- Cacheable: HTTP cache mechanisms work naturally.
- Client-Server separation: Frontend & backend are decoupled.

**Example in SkillBarter:**
```
GET    /api/users/{id}           ← Read
POST   /api/users                ← Create
PUT    /api/users/{id}           ← Update
DELETE /api/users/{id}           ← Delete
```

---

### 3. Dependency Injection (DI)
**What?** Pattern where dependencies are injected into a class rather than created inside.

**Why?**
- Loose coupling: Classes don't depend on concrete implementations.
- Easy to test: Mock dependencies in tests.
- Flexible: Can swap implementations without changing code.

**Usage in SkillBarter:**
```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor
public class UserService {
    private final UserRepo userRepo;  // Injected by Spring
    
    public User getById(Integer id) {
        return userRepo.findById(id).orElseThrow();
    }
}
```

---

## Security

### 1. JWT (JSON Web Token)
**What?** Stateless token-based authentication mechanism.

**Structure:** `Header.Payload.Signature`

**Why?**
- Stateless: No session storage on server.
- Scalable: Works across multiple servers/microservices.
- Mobile-friendly: Can be sent in headers, no cookies required.
- Self-contained: Token carries user info (payload).

**Flow in SkillBarter:**
1. User logs in → `POST /api/auth/login`
2. Server creates JWT token with user email as subject.
3. Client stores token.
4. Client sends token in header: `Authorization: Bearer <token>`
5. Server validates token on each request.

**Implementation:**
```java
@Component
public class JwtUtil {
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
```

---

### 2. Spring Security
**What?** Framework for authentication & authorization in Spring apps.

**Why?**
- Declarative security: Use annotations, not code scattered everywhere.
- Flexible: Supports multiple auth mechanisms (JWT, OAuth, Basic, etc.).
- CSRF protection: Built-in.
- Session management: Configurable.

**Usage in SkillBarter:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> 
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, 
                UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

**Why STATELESS?**
- JWT tokens don't require server-side session storage.
- Horizontally scalable: Any server can validate any token.

---

### 3. Password Hashing (BCrypt)
**What?** One-way encryption for passwords using BCrypt algorithm.

**Why?**
- Not reversible: Even if DB is breached, passwords can't be recovered.
- Salted: Each password has unique salt, preventing rainbow table attacks.
- Adaptive: Gets slower over time as computers get faster.

**Usage in SkillBarter:**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// During registration
user.setPasswordHash(passwordEncoder.encode(rawPassword));

// During login
authManager.authenticate(
    new UsernamePasswordAuthenticationToken(email, rawPassword)
);
```

---

## Database & ORM

### 1. MySQL
**What?** Relational database management system.

**Why?**
- ACID compliance: Data integrity guaranteed.
- Scalable: Can handle large datasets.
- Open-source: Free, widely supported.
- Relational: Enforces data relationships.

**SkillBarter setup:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillbarter_db
spring.datasource.username=root
spring.datasource.password=root
```

---

### 2. JPA (Java Persistence API)
**What?** Standard interface for ORM in Java.

**Why?**
- Abstraction: Database logic separated from Java code.
- Database-agnostic: Easy to switch databases.
- Standard: Not vendor-specific.

**Usage in SkillBarter:**
```java
@Repository
public interface UserRepo extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByNameContainingIgnoreCase(String name);
}
```

---

### 3. Hibernate
**What?** ORM implementation of JPA specification.

**Why?**
- Automatic DDL: Creates/updates DB schema automatically.
- Lazy loading: Loads related entities only when needed.
- Caching: First-level cache improves performance.
- Query language (HQL): Database-agnostic SQL.

**Auto DDL in SkillBarter:**
```properties
spring.jpa.hibernate.ddl-auto=update
# Options: validate, update, create, create-drop
```

---

### 4. Entity Relationships

**One-to-Many Example (User → Sessions):**
```java
@Entity
public class User {
    @OneToMany(mappedBy = "mentor")
    private List<Session> mentorSessions;
}

@Entity
public class Session {
    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private User mentor;
}
```

**Why?**
- Enforces referential integrity.
- Cascading operations (delete user → delete sessions).
- Query optimization via lazy/eager loading.

---

### 5. Transactions
**What?** Atomic database operations that ensure consistency.

**Why?**
- All-or-nothing: Either complete or rollback entirely.
- Prevents data corruption: Partial updates not allowed.

**Usage in SkillBarter:**
```java
@Service
@Transactional  // Entire method is transactional
public class UserService {
    public User updateProfile(Integer id, User updated) {
        User user = userRepo.findById(id).orElseThrow();
        user.setName(updated.getName());
        // If error occurs, rollback automatically
        return userRepo.save(user);
    }
}
```

---

## API Design

### 1. HTTP Methods (CRUD)

| Method | Operation | Idempotent | Use Case |
|--------|-----------|------------|----------|
| GET    | Read      | Yes        | Fetch resource |
| POST   | Create    | No         | Create new resource |
| PUT    | Update    | Yes        | Replace entire resource |
| PATCH  | Partial   | No         | Update specific fields |
| DELETE | Delete    | Yes        | Remove resource |

**SkillBarter examples:**
```
GET    /api/users/{id}          → Fetch user
POST   /api/users               → Create user
PUT    /api/users/{id}          → Update full user
PATCH  /api/users/{id}/password → Update password only
DELETE /api/users/{id}          → Delete user
```

---

### 2. HTTP Status Codes
**Why?** Communicate result status to client.

**Common in SkillBarter:**
- `200 OK`: Request successful.
- `201 Created`: Resource created.
- `204 No Content`: Success, no response body.
- `400 Bad Request`: Invalid input.
- `401 Unauthorized`: Missing/invalid auth.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Server error.

---

### 3. Request/Response Wrapping
**What?** Consistent structure for all API responses.

**Why?**
- Client knows what to expect.
- Easy error handling.
- Metadata (success flag, message) included.

**Usage in SkillBarter:**
```java
@Data @AllArgsConstructor @NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
}

// Usage
return ResponseEntity.ok(
    ApiResponse.success("User created", user)
);
```

---

### 4. Validation
**What?** Ensuring input meets requirements before processing.

**Why?**
- Prevents invalid data in DB.
- Provides user feedback early.
- Reduces downstream errors.

**Usage in SkillBarter:**
```java
@PostMapping("/register")
public ResponseEntity<User> register(
    @Valid @RequestBody RegisterRequest req  // Validates input
) {
    return ResponseEntity.ok(authService.register(
        req.getName(), req.getEmail(), req.getPassword()
    ));
}

// RegisterRequest
@Data
public class RegisterRequest {
    @NotBlank(message = "Name required")
    private String name;
    
    @Email(message = "Invalid email")
    private String email;
    
    @NotBlank(message = "Password required")
    private String password;
}
```

---

## Business Logic

### 1. Service Layer
**What?** Business rules and operations centralized in services.

**Why?**
- Reusable: Called by controllers, tests, other services.
- Testable: Can mock repos, test logic independently.
- Maintainable: Changes in logic don't affect controllers.

**Example in SkillBarter:**
```java
@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {
    private final SessionRepo sessionRepo;
    private final UserRepo userRepo;
    
    public Session createSession(Session session) {
        // Business logic: Validate mentor/learner/skill exist
        User mentor = userRepo.findById(session.getMentor().getUserId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        User learner = userRepo.findById(session.getLearner().getUserId())
                .orElseThrow(() -> new RuntimeException("Learner not found"));
        
        session.setMentor(mentor);
        session.setLearner(learner);
        session.setStatus(SessionStatus.Scheduled);
        return sessionRepo.save(session);
    }
}
```

---

### 2. Repository Pattern
**What?** Data access abstraction layer.

**Why?**
- Abstract database details from business logic.
- Easy to test: Mock repository in tests.
- Easy to switch DB: Implement new repo without changing services.

**Example in SkillBarter:**
```java
@Repository
public interface MatchRepo extends JpaRepository<Match, Integer> {
    @Query("SELECT m FROM Match m WHERE m.user1.userId = :userId OR m.user2.userId = :userId")
    List<Match> findAllMatchesByUser(@Param("userId") Integer userId);
}
```

---

## Design Patterns

### 1. Builder Pattern
**What?** Fluent object construction with optional fields.

**Why?**
- Readable: Clear intent what fields are set.
- Type-safe: Compile-time checking.
- Flexible: Optional fields without multiple constructors.

**Usage in SkillBarter:**
```java
User user = User.builder()
    .name("John")
    .email("john@mail.com")
    .passwordHash(encoded)
    .xp(0)
    .build();
```

---

### 2. Singleton Pattern
**What?** Only one instance of a class in entire app.

**Why?**
- Resource efficiency: Beans created once.
- Consistency: Same instance shared across app.

**Usage in SkillBarter (Spring Beans):**
```java
@Component  // Spring creates single instance
public class JwtUtil {
    // Only one instance across entire app
}

@Service    // Singleton
public class UserService {
    // Only one instance
}
```

---

### 3. Data Transfer Object (DTO)
**What?** Lightweight object carrying data between layers.

**Why?**
- Security: Don't expose entire entity to API.
- Flexibility: API contract independent of DB schema.
- Performance: Fetch only needed fields.

**Usage in SkillBarter:**
```java
// Controller accepts LoginRequest (DTO), not User entity
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
    @Valid @RequestBody LoginRequest req  // DTO
) {
    String token = authService.login(req.getEmail(), req.getPassword());
    return ResponseEntity.ok(new LoginResponse(token));  // Response DTO
}
```

---

### 4. Service Locator Pattern (Dependency Injection)
**What?** Spring manages object creation & lifecycle.

**Why?**
- Centralized: Spring manages beans.
- Decoupled: No hardcoded dependencies.
- Testable: Easy to inject mocks.

---

## Data Models

### Core Entities

#### 1. User
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue
    private Integer userId;
    
    @Email @NotBlank
    @Column(unique = true)
    private String email;
    
    @JsonIgnore  // Don't expose in API
    private String passwordHash;
    
    private String bio;
    private Integer xp;  // Experience points
}
```

**Why?**
- Core entity: Every user has profile, credentials, reputation (xp).

---

#### 2. Skill & Category
```java
@Entity
public class Skill {
    @Id @GeneratedValue
    private Integer skillId;
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}

@Entity
public class Category {
    @Id @GeneratedValue
    private Integer categoryId;
    private String name;  // "Programming", "Design"
}
```

**Why?**
- Categorized skills: Easier discovery & filtering.
- Reusable: Multiple skills per category.

---

#### 3. UserSkill
```java
@Entity
@Table(name = "user_skills")
public class UserSkill {
    @Id @GeneratedValue
    private Integer userSkillId;
    
    private Integer userId;
    
    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;
    
    private Boolean isTeach;  // User offers this skill
    private Boolean isLearn;  // User wants to learn
}
```

**Why?**
- Profile skills: Shows what each user teaches/wants to learn.
- Matching basis: Users matched by complementary skills.

---

#### 4. Session
```java
@Entity
@Table(name = "sessions")
public class Session {
    @Id @GeneratedValue
    private Integer sessionId;
    
    @ManyToOne
    private User mentor;      // Teaching
    
    @ManyToOne
    private User learner;     // Learning
    
    @ManyToOne
    private Skill skill;      // What's being taught
    
    private LocalDateTime scheduledAt;
    
    @Enumerated(EnumType.STRING)
    private SessionStatus status;  // Scheduled, Completed, Cancelled
}
```

**Why?**
- Core marketplace entity: Represents 1:1 learning session.
- Traceable: Mentor, learner, skill, time all tracked.

---

#### 5. Transaction
```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id @GeneratedValue
    private Integer transactionId;
    
    @ManyToOne
    private User user;        // Who paid
    
    @ManyToOne
    private Session session;  // For which session
    
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;  // UPI, Card, NetBanking
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;  // Success, Failure, Pending
}
```

**Why?**
- Payment tracking: Who paid, how much, for what.
- Audit trail: History of all transactions.

---

#### 6. Review
```java
@Entity
@Table(name = "reviews")
public class Review {
    @Id @GeneratedValue
    private Integer reviewId;
    
    @ManyToOne
    private User reviewer;    // Who gave review
    
    @ManyToOne
    private User reviewee;    // Who received review
    
    private BigDecimal rating;  // 1-5 stars
    private String reviewText;
}
```

**Why?**
- Reputation system: Users can see others' feedback.
- Matching improvement: Algorithm can factor in ratings.

---

#### 7. Message & Notification
```java
@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue
    private Integer messageId;
    
    @ManyToOne
    private Session session;  // In-session chat
    
    @ManyToOne
    private User sender;
    
    private String content;
    private LocalDateTime sentAt;
}

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue
    private Integer notificationId;
    
    @ManyToOne
    private User user;        // For whom
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;  // Session, Message, Transaction, Story
    
    private String content;
    private Boolean isRead;
}
```

**Why?**
- Communication: Real-time session chat.
- Alerts: Users notified of events (new session, payment, story).

---

#### 8. CommunityStory
```java
@Entity
@Table(name = "community_stories")
public class CommunityStory {
    @Id @GeneratedValue
    private Integer storyId;
    
    @ManyToOne
    private User user;  // Author
    
    private String title;
    private String content;
    private String mediaUrl;
    private LocalDateTime createdAt;
}
```

**Why?**
- Community engagement: Users share experiences.
- Social proof: Others see success stories.

---

#### 9. Calendar
```java
@Entity
@Table(name = "calendar")
public class Calender {
    @Id @GeneratedValue
    private Integer eventId;
    
    @ManyToOne
    private User user;
    
    private LocalDateTime eventDate;
    private String description;
}
```

**Why?**
- Event tracking: Users manage availability.
- Scheduling: Avoid double-bookings.

---

#### 10. Match
```java
@Entity
@Table(name = "matches")
public class Match {
    @Id @GeneratedValue
    private Integer matchId;
    
    @ManyToOne
    private User user1;
    
    @ManyToOne
    private User user2;
    
    private BigDecimal matchScore;  // Compatibility percentage
}
```

**Why?**
- Matching algorithm: Recommend compatible learners/mentors.
- Leaderboard: Top matches ranked by score.

---

## Key Features Built on These Concepts

### 1. Authentication & Authorization
- JWT tokens for stateless auth.
- Password hashing for security.
- Spring Security filters every request.

### 2. Skill Discovery & Matching
- Users register skills they teach/learn.
- Algorithm creates matches based on skill complementarity.
- Leaderboard shows best matches.

### 3. Session Management
- Users schedule sessions with matched partners.
- Sessions tracked with status (Scheduled, Completed, Cancelled).
- In-session messaging enabled.

### 4. Payments & Transactions
- After session, payment recorded.
- Multiple payment methods supported.
- Transaction history maintained.

### 5. Community & Feedback
- Users leave reviews & ratings.
- Share success stories.
- Notifications keep users informed.

### 6. Scalability & Maintainability
- Layered architecture separates concerns.
- Service layer centralizes business logic.
- Repository pattern abstracts DB.
- Stateless JWT allows horizontal scaling.
- Environment-driven config (no hardcoding).

---

## Summary Table

| Concept | Purpose | Benefit |
|---------|---------|---------|
| Spring Boot | Framework setup | Rapid development |
| JWT | Authentication | Stateless, scalable |
| Spring Security | Authorization | Secure, declarative |
| JPA/Hibernate | ORM | DB-agnostic, maintainable |
| MySQL | Database | ACID, relational |
| REST | API design | Standard, scalable |
| Service Layer | Business logic | Reusable, testable |
| Repository Pattern | Data access | Abstracted, testable |
| Builder Pattern | Object creation | Readable, type-safe |
| DTOs | Data transfer | Secure, flexible |
| Transactions | DB operations | Consistent, atomic |
| Dependency Injection | Object management | Decoupled, testable |

---

**End of Concepts Guide**
