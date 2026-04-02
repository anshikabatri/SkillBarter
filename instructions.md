Steps to Run (Local MySQL)

1. Clone the repository
   - `git clone https://github.com/anshikabatri/SkillBarter.git`
   - `cd SkillBarter`

2. Create `.env`
   - Copy `.env.example` to `.env`
   - Set DB values for your local MySQL:
     - `DB_HOST=localhost`
     - `DB_PORT=3306`
     - `DB_NAME=skillbarter_db`
     - `DB_USER=root`
     - `DB_PASSWORD=root` (or your local password)
   - Keep `APP_SEED_DATA=true` for first run.

3. Ensure MySQL is running
   - Start local MySQL service before running app.

4. Run backend
   - `cd skillbarter`
   - Windows: `./mvnw.cmd spring-boot:run`
   - macOS/Linux: `./mvnw spring-boot:run`

5. Verify startup
   - App starts on port `8081`.
   - On empty DB, dummy data is auto inserted.

Seeded test users
- `john@mail.com / secret123`
- `priya@mail.com / secret123`
- `arun@mail.com / secret123`