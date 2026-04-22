# 🚀 SkillBarter - FREE Deployment - QUICK START

> Important: if Render does not show a Java runtime for your account, use the Docker path in [RENDER_DOCKER_QUICKSTART.md](./RENDER_DOCKER_QUICKSTART.md). That is the working free setup for this project.

## What I've Done For You

✅ **Backend Prepared**
- Added PostgreSQL support (better for free tier)
- Added CORS configuration for Vercel domains
- Updated application.properties for environment variables
- Added render.yaml configuration file

✅ **Frontend Prepared**
- Created production environment file (environment.prod.ts)
- Set up Angular build for production
- Added Vercel configuration

✅ **Documentation Created**
- Full deployment guide (DEPLOYMENT_COMPLETE.md)
- Step-by-step checklist (DEPLOYMENT_CHECKLIST.md)
- Windows deployment script (deploy.bat)
- Linux deployment script (deploy.sh)

---

## 🎯 What You Need To Do NOW

### Timeline: ~45 minutes, ~3 free services to signup for

### STEP 1️⃣ : Git Commit (2 min)
```bash
cd c:\Users\2480142\SkillBarter
git add .
git commit -m "Prepare for production deployment"
git push origin deploy
```

### STEP 2️⃣ : Deploy Backend to Render (10 min)
1. Go to https://render.com
2. Sign up with GitHub
3. Create new Web Service
4. Configure & deploy (see DEPLOYMENT_CHECKLIST.md)
5. **Save your backend URL** (e.g., https://skillbarter-api.onrender.com)

### STEP 3️⃣ : Deploy Frontend to Vercel (5 min)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import & deploy (see DEPLOYMENT_CHECKLIST.md)
4. **Save your frontend URL** (e.g., https://skillbarter.vercel.app)

### STEP 4️⃣ : Connect Frontend to Backend (5 min)
1. Edit: `frontend-main/skillbarter-v2/src/environments/environment.prod.ts`
2. Replace the `apiUrl` with your Render URL
3. Git commit and push
4. Vercel auto-redeploys

### STEP 5️⃣ : Test (5 min)
- Visit your Vercel URL
- Sign up, login, create profile
- Check browser console for API calls

---

## 📋 Detailed Reference

| Task | Duration | Details |
|------|----------|---------|
| Backend Deployment | 10 min | See DEPLOYMENT_COMPLETE.md → PART 4 |
| Frontend Deployment | 5 min | See DEPLOYMENT_COMPLETE.md → PART 5 |
| Connection Setup | 5 min | See DEPLOYMENT_COMPLETE.md → PART 6 |
| Testing | 5 min | See DEPLOYMENT_COMPLETE.md → PART 7 |

---

## 💰 Cost

**Total Monthly Cost: $0** ✓

- Vercel: Free
- Render: Free (1 web service + 1 PostgreSQL DB)
- No credit card required

**Free tier includes**:
- 1 web service (backend)
- 1 PostgreSQL database
- Auto-sleep after 15 min inactivity
- Limited storage/bandwidth (more than enough for hobby projects)

---

## 🔐 Important Security Notes

✅ **Environment Variables**:
- Don't commit `.env` files to git
- Store JWT_SECRET, DB passwords in Render dashboard
- Use strong JWT_SECRET (at least 32 characters)

✅ **CORS**: 
- Configured to only allow your Vercel domain
- Update with your actual domain after deployment

✅ **Database**:
- PostgreSQL connection is secure
- Only accessible from your backend

---

## 📱 What You Can Do After Deployment

1. **Share with friends**
   - Give them your Vercel URL
   - They can sign up and use the app

2. **Monitor uptime**
   - Setup free Uptime Robot to wake backend when needed
   - Prevent auto-sleep issues

3. **Scale later**
   - Upgrade to paid tiers if needed ($15-30/month)
   - Add custom domain ($10-15/year)
   - Add AWS S3 for file uploads ($0-5/month)

---

## 🆘 If Something Goes Wrong

1. **Backend won't build?**
   - Check Java version 17 is installed
   - Check pom.xml has no syntax errors

2. **CORS errors in browser?**
   - Verify environment.prod.ts has correct backend URL
   - Make sure backend is running on Render

3. **Can't login?**
   - Check JWT_SECRET is set in Render
   - Check database is connected
   - Verify backend logs in Render dashboard

4. **API calls failing?**
   - Press F12 in browser
   - Check Network tab
   - Look for actual error messages
   - Check backend logs on Render dashboard

**Resources**:
- DEPLOYMENT_COMPLETE.md → Troubleshooting section
- DEPLOYMENT_CHECKLIST.md → Common Issues table

---

## 📚 Files You Need To Know

| File | Purpose |
|------|---------|
| `DEPLOYMENT_COMPLETE.md` | Full step-by-step guide |
| `DEPLOYMENT_CHECKLIST.md` | Quick checkbox list |
| `deploy.bat` | Windows build script (optional) |
| `deploy.sh` | Linux/Mac build script (optional) |
| `skillbarter/render.yaml` | Render configuration |
| `frontend-main/skillbarter-v2/vercel.json` | Vercel configuration |
| `skillbarter/src/main/resources/application.properties` | Backend config (already updated) |
| `skillbarter/src/main/java/.../CorsConfig.java` | CORS settings (already updated) |

---

## ✨ Next Steps After Live

1. **Domain Setup** (optional)
   - Buy domain (Namecheap/GoDaddy)
   - Point to Vercel (easier than Render)
   - Add to Vercel project settings

2. **Add Features**
   - Implement more features for the app
   - Scale to more users

3. **Monitoring & Analytics**
   - Add Sentry for error tracking (free)
   - Add analytics (Google Analytics - free)
   - Monitor database performance

4. **Backup**
   - Regular database backups
   - Export data periodically

---

## 🎓 Learning Resources

- Spring Boot: https://spring.io/guides
- Angular: https://angular.io/guide
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- PostgreSQL: https://www.postgresql.org/docs

---

## Summary

You're now ready to go **LIVE**! 🎉

1. Open DEPLOYMENT_CHECKLIST.md
2. Follow each step
3. Your app will be accessible at your Vercel URL within 45 minutes
4. **ZERO COST** 💰

**Questions? Check:**
- DEPLOYMENT_COMPLETE.md for detailed explanations
- DEPLOYMENT_CHECKLIST.md for quick reference
- Error sections for common problems

**You've got this!** 🚀

---

*Last updated: 2026-04-22*
*All files ready for deployment*
