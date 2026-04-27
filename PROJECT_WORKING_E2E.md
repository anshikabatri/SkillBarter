# SkillBarter End-to-End Working (Frontend + Backend)

This document explains how the complete system works from user action to database updates.

---

## 1) System architecture

### Frontend
- Angular app (`frontend-main/skillbarter-v2`)
- Sends REST API requests to backend base URL from environment config

### Backend
- Spring Boot app (`skillbarter`)
- Layered design:
  - Controller (API endpoints)
  - Service (business rules)
  - Repository (JPA DB access)
  - Model (entities)

### Database
- MySQL persistence for users, skills, sessions, messages, reviews, matches, etc.

---

## 2) Startup and connectivity flow

1. Angular starts, restores saved theme.
2. User opens login/signup.
3. On login success:
   - Backend returns JWT
   - Frontend stores token
   - Interceptor adds token to all protected API calls
4. Guard checks token + user presence before entering `/app/**` routes.

---

## 3) Authentication lifecycle

## Register
1. Frontend sends signup payload.
2. Backend validates and stores user.
3. Frontend auto-logins with same credentials.
4. JWT is stored in browser.

## Login
1. Credentials sent to backend.
2. If valid, backend returns JWT.
3. Frontend resolves current user profile and stores it.

## Forgot / Reset Password
1. User submits email in forgot-password screen.
2. Backend issues reset token with expiry.
3. User submits token + new password.
4. Backend verifies token and updates password hash.

---

## 4) Profile and onboarding working

## Profile setup
- Current flow: user adds `name` and `bio`.
- Frontend calls update profile endpoint.

## Profile photo upload
1. User selects image file in Profile page.
2. Frontend sends multipart/form-data upload call.
3. Backend validates/stores file in uploads folder.
4. Backend returns photo URL.
5. Frontend updates user image across UI (including topbar avatar).

---

## 5) Skills and matching working

## Skills source
- Frontend can fetch platform-defined skill list from backend.

## User skills
- User teach/learn skill intent is stored as user-skill relations.
- Matching logic compares:
  - What I can teach you
  - What you can teach me
- Score is recalculated and synchronized server-side to avoid stale values.

## Match suggestions
1. Frontend requests suggestions for current user.
2. Backend computes reciprocal match score and returns sorted candidates.
3. Frontend shows top matches and allows connect action.

---

## 6) Session lifecycle working

## Session request
1. User picks partner, topic, date-time, mode, duration.
2. Frontend sends create session request.
3. Backend stores pending session.

## Session status updates
- Mentor/learner can move session status based on rules.
- Completed sessions become eligible for feedback/review.

## Review constraints (implemented)
- Only requester can rate.
- Only after session is completed.
- One review per reviewer per session.

This ensures review trust and prevents duplicate ratings.

---

## 7) Chat and notifications working

## Chat
1. Messages are linked to session context.
2. Frontend fetches messages for selected session.
3. New message calls backend send endpoint.
4. UI refreshes using periodic polling.

## Notifications
- Topbar fetches notification list.
- Supports mark-read behavior.
- Unread chat indicator is computed periodically in sidebar/topbar flow.

---

## 8) Community, progress, and engagement

## Community
- Story feed retrieval and posting.
- Contributor leaderboard.

## Progress
- XP, level progress, session counts, and completion metrics are aggregated for dashboard/progress pages.

---

## 9) Theme and UX working

- Dark/light mode toggle available in topbar near notification area.
- Theme choice stored in browser and restored on next app load.
- Global design tokens keep components visually consistent.

---

## 10) Typical complete user journey

1. User signs up and logs in.
2. User completes profile basics.
3. User explores suggested matches.
4. User connects and requests a session.
5. Session is accepted/completed.
6. Requester gives rating after completion.
7. Dashboard/progress reflects updated engagement.
8. User continues via chat, community, and more sessions.

This is the main end-to-end product loop.

---

## 11) API request flow (high-level)

For most actions:
1. Component triggers UI action
2. Component calls `ApiService`
3. Interceptor injects JWT
4. Backend controller endpoint receives request
5. Service applies business logic and validations
6. Repository writes/reads DB
7. Response returns to frontend
8. Component updates UI state

---

## 12) Operational checklist

Before running locally:
- Backend DB configuration in `application.properties` is correct
- Backend starts successfully
- Frontend `environment.ts` API URL points to backend
- CORS/static resource config is active for uploads

If those are correct, major flows (auth, profile, matching, session, review, chat, notifications) work end to end.
