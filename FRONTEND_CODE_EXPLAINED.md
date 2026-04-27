# SkillBarter Frontend Explained (Simple + In-Depth)

This document explains how the Angular frontend is structured, how each part works, and which core concepts are used.

---

## 1) Frontend stack at a glance

- Framework: Angular 17 (Standalone components)
- Routing: Angular Router with lazy-loaded pages
- HTTP: `HttpClient` + custom auth interceptor
- State (lightweight): `BehaviorSubject` in auth service + `localStorage`
- Styling: global CSS variables + component-level styles
- Theme: dark/light mode via CSS variable switching

---

## 2) App bootstrapping and global setup

### Entry point
- File: frontend-main/skillbarter-v2/src/main.ts
- Responsibilities:
  - Reads saved theme from `localStorage`
  - Sets `data-theme` on document root
  - Bootstraps Angular app

### Root component
- File: frontend-main/skillbarter-v2/src/app/app.component.ts
- This is intentionally minimal and only renders `<router-outlet>`.

### Application providers
- File: frontend-main/skillbarter-v2/src/app/app.config.ts
- Registers:
  - Router (`provideRouter(routes)`)
  - HTTP client with interceptor (`withInterceptors([authInterceptor])`)
  - Animations support

**Concept used:** central app-level dependency registration.

---

## 3) Routing and navigation model

### Routes
- File: frontend-main/skillbarter-v2/src/app/app.routes.ts

Public routes:
- `/` landing
- `/login`
- `/signup`
- `/forgot-password`

Protected routes:
- `/profile-setup`
- `/app/**` (dashboard, matches, chat, calendar, progress, community, profile, etc.)

### Auth guard
- File: frontend-main/skillbarter-v2/src/app/guards/auth.guard.ts
- Flow:
  1. If no token in `localStorage`, redirect to `/login`
  2. If token exists but current user not in memory, resolve from backend
  3. If resolution fails, logout and block route

**Concepts used:** route protection, lazy loading, fallback user hydration.

---

## 4) Authentication and session handling

### Auth service
- File: frontend-main/skillbarter-v2/src/app/services/auth.service.ts

Main responsibilities:
- Register user (`/auth/register`)
- Login user (`/auth/login`)
- Forgot/reset password
- Decode email from JWT payload
- Resolve authenticated user from backend
- Normalize user object (`xp`, profile image URL)
- Keep user state in `BehaviorSubject`

`localStorage` keys used:
- `token`
- `user`
- `userEmail`
- `theme`

**Concepts used:**
- Observable-based auth state (`currentUser$`)
- Stateless auth token strategy
- Local persistence + in-memory reactive state

### Auth interceptor
- File: frontend-main/skillbarter-v2/src/app/services/auth.interceptor.ts
- Adds `Authorization: Bearer <token>` to outgoing HTTP requests.

**Concept used:** cross-cutting HTTP concern handled once globally.

---

## 5) API abstraction layer

### API service
- File: frontend-main/skillbarter-v2/src/app/services/api.service.ts

This service wraps all backend endpoints into simple frontend methods:
- Users (`getUser`, `updateUser`, photo upload)
- Skills (`getAllSkills`, search, user skills)
- Matches (suggestions, create, list)
- Sessions (mentor/learner, create, status update)
- Messages, Notifications, Reviews, Stories, Calendar, Transactions

It also normalizes mixed backend response shapes with `map((res) => res?.data || res)` in places.

**Concept used:** single source of HTTP calls to keep components cleaner.

---

## 6) Layout architecture

### Sidebar layout shell
- File: frontend-main/skillbarter-v2/src/app/components/sidebar/sidebar.component.ts
- Hosts:
  - Left navigation
  - Topbar component
  - Child page outlet

Also polls chat-related APIs every 5s to show unread chat indicator.

### Topbar
- File: frontend-main/skillbarter-v2/src/app/components/topbar/topbar.component.ts
- Features:
  - SP (XP) badge
  - Notifications panel
  - User profile dropdown
  - Dark/light mode toggle

**Concepts used:**
- UI shell composition
- periodic polling
- stateful UI panels (dropdowns, notification drawer)

---

## 7) Page-by-page behavior

### Landing, Login, Signup, Forgot Password
- Landing: marketing entry page
- Login: token creation + user resolution
- Signup: creates account, then login, then moves to profile setup
- Forgot Password: token generation + reset flow

### Profile Setup
- Current simplified form: `name` and `bio` only.
- Saves user profile then routes to dashboard.

### Dashboard
- Aggregates sessions and matches.
- Shows activity stats and top matches cards.
- Handles score formatting safely.

### Matches
- Uses backend match suggestions for score-driven cards.
- Supports “Connect” action (creates persisted match).
- “My Matches” tab shows connected users.

### Chat
- Fetches sessions as conversation groups.
- Loads/sends messages per session.
- Polls for updates and keeps opened-session state in local storage.

### Calendar
- Create session request UI.
- Mark scheduled session as completed.
- Requester-only rating after completion (review integration).

### Progress
- Computes level, XP progress, session stats, badges/goals.

### Community
- Story feed + top contributors leaderboard.

### Profile
- Edit profile + upload profile photo.
- Avatar updates in topbar after save.

### Saved Profiles / Subscriptions
- Saved profiles from matches.
- Subscription plans UI (presentational currently).

---

## 8) Styling and theme system

### Global style tokens
- File: frontend-main/skillbarter-v2/src/styles.css
- Uses CSS variables for all major colors/surfaces.
- Dark is default (`:root`).
- Light theme overrides in `:root[data-theme='light']`.

### Theme switching
- Implemented in topbar by toggling `data-theme` attribute.
- Persisted to `localStorage`.

**Concept used:** design token driven theming.

---

## 9) Important frontend concepts implemented

1. Standalone components (no classic NgModule page modules)
2. Lazy-loaded routes for better startup performance
3. Route guards for auth-protected sections
4. HTTP interceptor for token injection
5. BehaviorSubject-based session state
6. API abstraction service for maintainability
7. Polling for near-real-time UI where websocket is not used
8. CSS variable theme architecture for dark/light mode

---

## 10) Practical caveats (current codebase)

- Some pages still use polling; real-time websocket would reduce repeated requests.
- Some API endpoints return wrapped data while others return raw entities; frontend handles both.
- Chat unread logic is message-count based; can be improved to true per-user read receipts.

---

## 11) Summary

Frontend is organized as:
- **Shell layout (sidebar/topbar)**
- **Feature pages**
- **Core services (auth/api/interceptor/guard)**
- **Global theme/styling system**

It is a clean, scalable base and already implements most typical product flows end to end.
