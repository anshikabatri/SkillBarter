# SkillBarter

Spring Boot backend for a skill-exchange platform.

## Tech Stack
- Java 17
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA (Hibernate)
- MySQL

## Prerequisites
- Java 17+
- MySQL 8+
- Maven (or use `mvnw` wrapper)

## Quick Start (Local MySQL)

1. Clone repository.
2. Create `.env` in the project root by copying `.env.example`.
3. Update DB credentials in `.env` if your local MySQL values are different.
4. Ensure MySQL server is running.
5. Start the app.

### `.env` example
Use:

- `SERVER_PORT=8081`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_NAME=skillbarter_db`
- `DB_USER=root`
- `DB_PASSWORD=root`
- `JWT_SECRET=any_random_string_minimum_32_characters_long`
- `JWT_EXPIRATION_MS=86400000`
- `APP_SEED_DATA=true`

## Run
From [skillbarter](skillbarter):

- Windows: `./mvnw.cmd spring-boot:run`
- macOS/Linux: `./mvnw spring-boot:run`

On first successful startup, dummy data is automatically inserted if `APP_SEED_DATA=true`.

## Seeded login users
- `john@mail.com` / `secret123`
- `priya@mail.com` / `secret123`
- `arun@mail.com` / `secret123`

## API Base URL
- `http://localhost:8081`

## First Postman flow
1. `POST /api/auth/login` with seeded credentials.
2. Copy JWT token from response.
3. Add `Authorization: Bearer <token>` header for protected APIs.
4. Try:
	- `GET /api/users`
	- `GET /api/stories`
	- `GET /api/matches/leaderboard`
	- `GET /api/calendar/user/1/upcoming`

## Notes
- DB schema is auto-created/updated using Hibernate (`spring.jpa.hibernate.ddl-auto=update`).
- Seeder runs only when there are no users in DB.