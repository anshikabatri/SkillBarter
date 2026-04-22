@echo off
REM Complete Deployment Script for SkillBarter (Windows)

setlocal enabledelayedexpansion

echo.
echo ================================================
echo   SkillBarter - FREE Deployment Script (Windows)
echo ================================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Error: Git repository not found!
    echo Please run: git init
    exit /b 1
)

REM Step 1: Verify project structure
echo [1/6] Verifying project structure...
if not exist "skillbarter\pom.xml" (
    echo Error: Backend pom.xml not found!
    exit /b 1
)
if not exist "frontend-main\skillbarter-v2\package.json" (
    echo Error: Frontend package.json not found!
    exit /b 1
)
echo [OK] Project structure verified

REM Step 2: Build Backend
echo.
echo [2/6] Building Spring Boot backend...
cd skillbarter
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Error: Backend build failed!
    exit /b 1
)
echo [OK] Backend built successfully
cd ..

REM Step 3: Build Frontend
echo.
echo [3/6] Building Angular frontend...
cd frontend-main\skillbarter-v2
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed!
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo Error: Frontend build failed!
    exit /b 1
)
echo [OK] Frontend built successfully
cd ..\..

REM Step 4: Commit changes
echo.
echo [4/6] Committing changes to git...
git add .
git commit -m "Deploy: Build frontend and backend for production"
if %errorlevel% equ 0 (
    echo [OK] Changes committed
) else (
    echo [NOTE] No changes to commit or commit failed
)

REM Step 5: Display instructions
echo.
echo [5/6] Preparing deployment instructions...
echo.
echo ===============================================
echo   DEPLOYMENT INSTRUCTIONS
echo ===============================================
echo.
echo STEP 1: Deploy Frontend to Vercel
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 1. Go to https://vercel.com
echo 2. Click "Add New..." ^> "Project"
echo 3. Import your GitHub repository
echo 4. Settings:
echo    - Framework: Angular
echo    - Root Directory: frontend-main\skillbarter-v2
echo    - Build Command: npm run build
echo    - Output Directory: dist\skillbarter
echo 5. Click "Deploy"
echo 6. Copy the Vercel URL after deployment
echo.
echo STEP 2: Deploy Backend to Render
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 1. Go to https://render.com
echo 2. Click "New +" ^> "Web Service"
echo 3. Select your GitHub repository
echo 4. Settings:
echo    - Name: skillbarter-api
echo    - Environment: Java
echo    - Build Command: mvn clean install
echo    - Start Command: java -jar target/skillbarter-0.0.1-SNAPSHOT.jar
echo    - Plan: Free
echo 5. Set Environment Variables:
echo    - SERVER_PORT=8082
echo    - JWT_SECRET=^(generate a strong key^)
echo    - HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQL10Dialect
echo    - DB_DRIVER=org.postgresql.Driver
echo 6. Click "Create Web Service"
echo.
echo STEP 3: Connect Frontend to Backend
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 1. Update environment.prod.ts with your Render URL
echo 2. Redeploy frontend to Vercel
echo.
echo IMPORTANT NOTES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo * Free tier - both Vercel and Render are FREE
echo * Render includes FREE PostgreSQL database
echo * 15-minute inactivity auto-sleep on free plans
echo * See DEPLOYMENT.md for detailed instructions
echo.

echo [6/6] Deployment preparation complete!
echo.
pause
