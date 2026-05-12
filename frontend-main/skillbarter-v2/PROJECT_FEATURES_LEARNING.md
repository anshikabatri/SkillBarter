# SkillBarter Project Learning Guide

## Purpose
This document explains the main user-facing features of the SkillBarter application and how they work together.
It is intended as a professional learning and presentation reference for the frontend experience.

## Product Overview
SkillBarter is a skill-exchange platform where users can:
- register and build a profile,
- match with other users,
- book learning sessions,
- chat with session partners,
- complete sessions and earn XP,
- leave reviews,
- send tips/donations,
- manage saved profiles and notifications.

The application is built as an Angular single-page app with a protected authenticated area under `/app`.

## Main App Structure
The authenticated experience is organized around a shared shell:
- `src/app/components/sidebar/sidebar.component.ts`
- `src/app/components/topbar/topbar.component.ts`
- `src/app/app.component.ts`
- `src/app/app.routes.ts`

This shell provides navigation, notification handling, theme switching, and access to the main feature pages.

## Feature Walkthrough

### 1) Navigation / Navbar
The main navigation is implemented in the sidebar and topbar.

**What it does**
- Provides access to all core pages.
- Keeps the user in a consistent authenticated layout.
- Highlights the active route.

**Important routes**
- Dashboard
- Matches
- Chat
- Calendar
- Progress
- Community
- Profile
- Saved Profiles
- Donations / Subscriptions
- Video Call

**Relevant files**
- `src/app/components/sidebar/sidebar.component.html`
- `src/app/components/sidebar/sidebar.component.ts`
- `src/app/app.routes.ts`

### 2) Theme Toggle
A light/dark theme toggle is available in the topbar.

**What it does**
- Switches the UI between dark and light themes.
- Persists the choice in local storage.
- Updates the `data-theme` attribute on the root document so CSS variables can switch instantly.

**Relevant files**
- `src/app/components/topbar/topbar.component.ts`
- `src/app/components/topbar/topbar.component.html`
- `src/app/app.component.ts`
- `src/styles.css`

### 3) Notifications
Notifications are shown from the bell icon in the topbar.

**What it does**
- Shows unread count.
- Polls notifications periodically.
- Supports mark-as-read and mark-all-as-read actions.
- Displays special popups for incoming call and tip notifications.

**Why it matters**
- Keeps users informed about session activity and tips.
- Improves real-time engagement without forcing page reloads.

**Relevant files**
- `src/app/components/topbar/topbar.component.ts`
- `src/app/components/topbar/topbar.component.html`
- Backend notification service and controller

### 4) Chat
Chat is the main communication feature for booked or matched users.

**What it does**
- Lists conversations.
- Shows unread indicators.
- Opens a session thread.
- Sends and receives messages.
- Supports attachments and file previews where applicable.
- Refreshes conversation state periodically.

**User flow**
1. User opens Chat.
2. Conversation list loads from learner and mentor session data.
3. User selects a session.
4. Messages are loaded and shown in chronological order.
5. User sends new messages or files.

**Relevant files**
- `src/app/pages/chat/chat.component.ts`
- `src/app/pages/chat/chat.component.html`
- `src/app/pages/chat/chat.component.css`
- Backend message endpoints and services

### 5) Calendar and Session Management
The calendar page is the center for booking and managing sessions.

**What it does**
- Shows upcoming and history sessions.
- Lets a learner request a new session with a mentor.
- Validates date/time and skill selection.
- Supports marking completed sessions.
- Awards XP to both users when a session is completed.
- Allows reviews after completion.
- Provides a join-call action for video sessions.

**User flow**
1. User selects a mentor from matches.
2. User chooses a skill and future session time.
3. The request is created.
4. After the session, the user can mark it complete.
5. Both participants receive XP.
6. Either participant can leave a review.

**Relevant files**
- `src/app/pages/calendar/calendar.component.ts`
- `src/app/pages/calendar/calendar.component.html`
- `src/app/pages/calendar/calendar.component.css`
- Backend session, review, and user services

### 6) Reviews and Ratings
Reviews are tied to completed sessions and are reflected in the Progress page.

**What it does**
- Allows either participant in a completed session to review the other participant.
- Prevents self-reviews and duplicate reviews for the same session and reviewer.
- Displays average rating and total review count in Progress.

**Relevant files**
- `src/app/pages/calendar/calendar.component.ts`
- `src/app/pages/progress/progress.component.ts`
- Backend review controller, service, repository, and model

### 7) Profile
The profile page is where users manage their public identity.

**What it does**
- Updates name and bio.
- Uploads profile photo.
- Manages teach and learn skills.
- Validates name and photo inputs.
- Saves changes back to the backend and updates the current authenticated user.

**Relevant files**
- `src/app/pages/profile/profile.component.ts`
- `src/app/pages/profile/profile.component.html`
- `src/app/pages/profile/profile.component.css`
- Backend user controller and service

### 8) Saved Profiles
Saved Profiles shows match-based users and acts as a discovery area.

**What it does**
- Lists saved or matched profiles.
- Helps users revisit people they may want to connect with.
- Uses the current authenticated user context.

**Relevant files**
- `src/app/pages/saved-profiles/saved-profiles.component.ts`
- `src/app/pages/saved-profiles/saved-profiles.component.html`
- `src/app/pages/saved-profiles/saved-profiles.component.css`

### 9) Logout
Logout is part of the topbar user menu.

**What it does**
- Ends the authenticated session on the client.
- Returns the user to the public experience.
- Clears access to protected routes through the auth guard.

**Relevant files**
- `src/app/components/topbar/topbar.component.ts`
- `src/app/components/topbar/topbar.component.html`
- `src/app/guards/auth.guard.ts`

### 10) Chatbot in the Bottom Corner
A floating chatbot is available from the bottom-right corner of the app.

**What it does**
- Provides quick help inside the application.
- Supports canned questions.
- Offers multilingual interaction.
- Gives contextual guidance for common tasks like signup, posting a skill, and subscriptions.

**Relevant files**
- `src/app/components/chatbot/chatbot.component.ts`
- `src/app/components/chatbot/chatbot.component.html`
- `src/app/components/chatbot/chatbot.component.css`
- `src/app/app.component.ts`

### 11) Video Chat Option
The video chat option is used from the session flow.

**What it does**
- Opens an external video meeting room for the selected session.
- Uses the session ID to generate a room name.
- Redirects back after opening the meeting.

**Relevant files**
- `src/app/pages/video-call/video-call.component.ts`
- `src/app/pages/calendar/calendar.component.ts`

### 12) Donations / Tips
The donations feature lets users send tips after a completed session.

**What it does**
- Shows only completed sessions that can receive a tip.
- Supports multiple payment methods:
  - UPI
  - Card
  - Net Banking
- Includes custom input fields for the selected method.
- Supports a custom UPI ID when UPI `Other` is selected.
- Shows transaction history for both sent and received tips.
- Displays sender/counterparty information in the history table.

**Relevant files**
- `src/app/pages/subscriptions/subscriptions.component.ts`
- `src/app/pages/subscriptions/subscriptions.component.html`
- `src/app/pages/subscriptions/subscriptions.component.css`
- Backend transaction controller, service, repository, and model

## Code Walkthrough Examples

The sections below connect each feature to the code that powers it. These are short excerpts, written to help you explain the logic during a demo.

### App Shell and Theme
```ts
ngOnInit(): void {
  const saved = localStorage.getItem('sb-theme') || localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    this.theme = saved as 'light' | 'dark';
  }
  if (this.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
```
This code restores the user’s saved theme and updates the root document so the CSS variables switch immediately.

### Navigation and Chat Badge
```ts
private checkUnreadForUser(userId: number) {
  forkJoin({ learner: this.api.getSessionsByLearner(userId), mentor: this.api.getSessionsByMentor(userId) }).subscribe({
    next: ({ learner, mentor }) => {
      const sessions = [...(learner || []), ...(mentor || [])];
      this.hasUnreadChat = sessions.length > 0;
    }
  });
}
```
This is the idea behind the sidebar chat indicator: the app checks the user’s sessions and uses that state to decide whether the chat badge should be shown.

### Notifications and Popups
```ts
loadNotifs(userId: number) {
  this.api.getNotifications(userId).subscribe({
    next: (res: any) => {
      const list = Array.isArray(res) ? res : (res?.data || []);
      this.notifications = list.map((n: any) => ({ ...n, message: n?.message || n?.content }));
      this.unreadCount = this.notifications.filter((n: any) => !n.isRead).length;
      this.checkIncomingCall();
    }
  });
}
```
This method loads notifications, normalizes the response shape, counts unread items, and then checks for special call or tip alerts.

### Chat Conversation Flow
```ts
sendUserInput() {
  const text = (this.userInput || '').trim();
  if (!text) return;
  this.pushMessage('user', text);
  this.userInput = '';
  this.reply(text);
}
```
This is the same message pattern used throughout the chat area: capture input, append the user message, clear the textbox, and trigger the response flow.

### Calendar Session Requests
```ts
submitRequest() {
  if (!this.userId || !this.request.mentorId || !this.request.skillId || !this.request.scheduledAt) {
    this.requestError = 'Please fill all fields.';
    return;
  }

  this.api.createSession({
    mentor: { userId: this.request.mentorId },
    learner: { userId: this.userId },
    skill: { skillId: this.request.skillId },
    scheduledAt: this.request.scheduledAt.trim()
  }).subscribe({
    next: () => this.requestSuccess = 'Session request created successfully.'
  });
}
```
This code validates the request form and sends the session payload to the backend in the shape the API expects.

### Reviews and Ratings
```ts
rateSession(session: any) {
  const isMentor = Number(session?.mentor?.userId) === Number(this.userId);
  const revieweeId = Number(isMentor ? session?.learner?.userId : session?.mentor?.userId);
  this.api.addReview(this.userId, revieweeId, rating, reviewText, sessionId).subscribe();
}
```
This is the core review flow: the app determines the other participant and submits a review only after the session is complete.

### Profile Editing and Skills
```ts
save() {
  const name = String(this.form.name || '').trim();
  const bio = String(this.form.bio || '').trim();
  this.api.updateUser(this.user?.userId, { name, bio, email: this.user?.email }).subscribe({
    next: (u: any) => this.auth.setUser(u)
  });
}
```
This updates the profile on the server and immediately refreshes the authenticated user so the UI stays in sync.

### Chatbot Assistant
```ts
chooseQuestion(q: string) {
  this.pushMessage('user', q);
  this.reply(q);
}
```
This is a simple assistant pattern: the user picks a question, the bot stores the user message, and then it returns a matching canned response.

### Video Call Launch
```ts
ngOnInit() {
  this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
  const roomName = `skillbarter-session-${this.sessionId}`;
  window.open(`https://meet.element.io/${roomName}`, '_blank');
  history.back();
}
```
This page acts like a redirect helper. It builds a meeting room name from the session ID, opens the room, and then returns the user to the previous page.

### Donations and Tips
```ts
submit() {
  if (this.form.paymentMethod === 'Card') {
    // validate card number, expiry, CVV, and card holder name
  }

  if (this.form.paymentMethod === 'UPI' && this.form.upiApp === 'Other') {
    if (!this.form.upiId.trim()) {
      this.error = 'Please enter your UPI ID';
      return;
    }
  }

  this.api.createTransaction({
    user: { userId: this.userId },
    session: { sessionId: this.form.sessionId },
    amount: parseFloat(this.form.amount),
    paymentMethod: this.form.paymentMethod,
    status: 'Success'
  }).subscribe();
}
```
This validates the selected payment method and sends the transaction payload to the backend. The same component also merges sent and received tips into one history list.

## How the Pieces Connect
A typical user journey looks like this:
1. User signs in and lands in the authenticated shell.
2. The sidebar shows navigation, the topbar shows notifications and user actions.
3. The user matches with people, opens chat, and books a session from Calendar.
4. The session is marked complete, XP is awarded, and reviews become available.
5. The user can send a tip through Donations and track it in the transaction history.
6. Progress reflects XP, completed sessions, and review stats.

## Learning Notes
- The sidebar is the main route hub for authenticated users.
- The topbar handles account-level actions like notifications, theme, and logout.
- Calendar is the operational center for sessions and reviews.
- Chat and video call are the communication layer for booked sessions.
- Donations and reviews provide trust, appreciation, and user motivation.
- The chatbot gives in-app support without leaving the page.

## Key Files at a Glance
- `src/app/app.routes.ts`
- `src/app/components/sidebar/sidebar.component.ts`
- `src/app/components/topbar/topbar.component.ts`
- `src/app/components/chatbot/chatbot.component.ts`
- `src/app/pages/chat/chat.component.ts`
- `src/app/pages/calendar/calendar.component.ts`
- `src/app/pages/profile/profile.component.ts`
- `src/app/pages/saved-profiles/saved-profiles.component.ts`
- `src/app/pages/video-call/video-call.component.ts`
- `src/app/pages/subscriptions/subscriptions.component.ts`
- Backend controllers, services, repositories, and models under `skillbarter/src/main/java/com/cts/mfrp/skillbarter`

## Presentation Tip
For a demo, show the app in this order:
1. Sidebar and topbar shell
2. Chat
3. Calendar and session booking
4. Video call
5. Reviews and progress
6. Profile and saved profiles
7. Donations
8. Chatbot and notifications
9. Logout

---
End of guide.
