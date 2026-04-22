#!/bin/bash
# Complete Deployment Script for SkillBarter

set -e  # Exit on error

echo "================================================"
echo "  SkillBarter - FREE Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}Error: Git repository not found!${NC}"
    echo "Please run: git init"
    exit 1
fi

# Step 1: Verify project structure
echo -e "${YELLOW}[1/6] Verifying project structure...${NC}"
if [ ! -f "skillbarter/pom.xml" ] || [ ! -f "frontend-main/skillbarter-v2/package.json" ]; then
    echo -e "${RED}Error: Project structure is incomplete!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project structure verified${NC}"

# Step 2: Build Backend
echo ""
echo -e "${YELLOW}[2/6] Building Spring Boot backend...${NC}"
cd skillbarter
mvn clean package -DskipTests
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed!${NC}"
    exit 1
fi
cd ..

# Step 3: Build Frontend
echo ""
echo -e "${YELLOW}[3/6] Building Angular frontend...${NC}"
cd frontend-main/skillbarter-v2
npm install
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed!${NC}"
    exit 1
fi
cd ../..

# Step 4: Commit changes
echo ""
echo -e "${YELLOW}[4/6] Committing changes to git...${NC}"
git add .
git commit -m "Deploy: Build frontend and backend for production" || true
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed${NC}"
else
    echo -e "${YELLOW}⚠ No changes to commit or commit failed${NC}"
fi

# Step 5: Display next steps
echo ""
echo -e "${YELLOW}[5/6] Preparing deployment instructions...${NC}"

cat << 'EOF'

✅ BUILD COMPLETE! Ready to deploy.

NEXT STEPS - Deploy Frontend (Vercel):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import from Git: Select your repository
4. Settings:
   - Framework: Angular
   - Root Directory: frontend-main/skillbarter-v2
   - Build Command: npm run build
   - Output Directory: dist/skillbarter
5. Click "Deploy"
6. After deployment, copy your Vercel URL

NEXT STEPS - Deploy Backend (Render):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - Name: skillbarter-api
   - Environment: Java
   - Region: Oregon (or your choice)
   - Build Command: mvn clean install
   - Start Command: java -jar target/skillbarter-0.0.1-SNAPSHOT.jar
   - Plan: Free
5. Add Environment Variables:
   - SERVER_PORT: 8082
   - JWT_SECRET: (generate a strong secret key)
   - DB_HOST: (Render will provide)
   - DB_PORT: (Render will provide)
   - DB_NAME: skillbarter_db
   - DB_USER: (Render will provide)
   - DB_PASSWORD: (Render will provide)
   - HIBERNATE_DIALECT: org.hibernate.dialect.PostgreSQL10Dialect
   - DB_DRIVER: org.postgresql.Driver
6. Click "Create Web Service"
7. After deployment, copy your Render URL

FINAL STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Update frontend environment with backend URL:
   - File: frontend-main/skillbarter-v2/src/environments/environment.prod.ts
   - Replace: apiUrl: 'https://YOUR-RENDER-URL/api'
   
2. Redeploy frontend to Vercel

3. Test the deployed app:
   - Go to your Vercel URL
   - Test login, signup, and API calls

IMPORTANT NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Both services are FREE tier
✓ Render provides 1 free PostgreSQL database
✓ Free tier has 15-minute inactivity auto-sleep
✓ Uploads directory won't persist - consider AWS S3 (free tier available)
✓ For production, budget ~$15-30/month for better reliability

TROUBLESHOOTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- CORS errors? Check backend CORS configuration
- API calls failing? Verify backend URL in environment.prod.ts
- Database connection failed? Check DB credentials in Render dashboard
- Build failed? Check build logs in Render/Vercel dashboard

For detailed info, see: DEPLOYMENT.md
EOF

echo ""
echo -e "${GREEN}[6/6] Deployment preparation complete!${NC}"
echo ""
