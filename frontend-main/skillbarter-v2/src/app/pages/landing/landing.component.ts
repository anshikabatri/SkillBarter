import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="landing">
      <nav class="nav">
        <div class="nav-brand">SkillBarter</div>
        <div class="nav-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
        </div>
        <a routerLink="/login" class="btn-primary">Get started</a>
      </nav>

      <section class="hero">
        <div class="hero-content">
          <div class="hero-tag">Zero money. Real learning.</div>
          <h1>Learn anything.<br>Teach what you love.</h1>
          <p>Exchange skills instead of cash. Smart matching, real-time sessions, and a global community of learners.</p>
          <div class="hero-btns">
            <a routerLink="/signup" class="btn-primary">Get Started Free</a>
            <a routerLink="/login" class="btn-ghost">Sign In</a>
          </div>
        </div>
        <div class="hero-cards">
          <div class="hero-card">
            <div class="hc-label">Top Match</div>
            <div class="hc-name">Valerie</div>
            <div class="hc-score">95% match</div>
            <div class="hc-skill">Teaches: UX Research</div>
          </div>
          <div class="hero-card">
            <div class="hc-label">Session Request</div>
            <div class="hc-name">From William</div>
            <div class="hc-time">17 June · 14:00</div>
            <div class="hc-actions">
              <button class="btn-primary" style="padding:6px 14px;font-size:12px">Accept</button>
              <button class="btn-ghost" style="padding:6px 14px;font-size:12px">Decline</button>
            </div>
          </div>
        </div>
      </section>

      <section class="about" id="about">
        <h2>We believe everyone has something valuable to teach.</h2>
        <p>SkillBarter is a people-first space for peer learning. No expensive courses — just real people sharing real skills.</p>
      </section>

      <section class="features" id="features">
        <h2>Everything you need to grow.</h2>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let f of features">
            <div class="f-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <section class="cta">
        <h2>Ready to start learning?</h2>
        <div class="cta-btns">
          <a routerLink="/signup" class="btn-primary">Create Free Account</a>
          <a routerLink="/login" class="btn-ghost">Sign In</a>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-brand">SkillBarter</div>
        <p>© 2026 SkillBarter. Bringing real learning back to real people.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing { background:#060910; color:white; min-height:100vh; }
    .nav { display:flex; align-items:center; justify-content:space-between; padding:20px 60px; position:sticky; top:0; background:rgba(6,9,16,0.9); backdrop-filter:blur(10px); z-index:10; border-bottom:1px solid rgba(59,130,246,0.1); }
    .nav-brand { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#3b82f6; }
    .nav-links { display:flex; gap:32px; }
    .nav-links a { color:#8899bb; font-size:14px; text-decoration:none; transition:color 0.2s; }
    .nav-links a:hover { color:white; }
    .hero { display:flex; align-items:center; justify-content:space-between; padding:80px 60px; gap:60px; min-height:85vh; background:radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%); }
    .hero-content { flex:1; max-width:560px; }
    .hero-tag { display:inline-block; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); color:#60a5fa; font-size:13px; font-weight:600; padding:6px 14px; border-radius:20px; margin-bottom:24px; }
    h1 { font-family:'Syne',sans-serif; font-size:58px; font-weight:800; line-height:1.1; letter-spacing:-2px; margin-bottom:20px; }
    .hero-content p { color:#8899bb; font-size:16px; line-height:1.7; max-width:460px; margin-bottom:32px; }
    .hero-btns { display:flex; gap:12px; }
    .hero-cards { display:flex; flex-direction:column; gap:16px; width:260px; }
    .hero-card { background:rgba(255,255,255,0.04); border:1px solid rgba(59,130,246,0.15); border-radius:16px; padding:20px; }
    .hc-label { font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
    .hc-name { font-size:18px; font-weight:700; font-family:'Syne',sans-serif; margin-bottom:4px; }
    .hc-score { color:#3b82f6; font-size:14px; font-weight:600; margin-bottom:4px; }
    .hc-skill,.hc-time { color:#8899bb; font-size:13px; }
    .hc-actions { display:flex; gap:8px; margin-top:12px; }
    .about { background:#000; text-align:center; padding:80px 60px; }
    .about h2 { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; max-width:600px; margin:0 auto 16px; }
    .about p { color:#8899bb; max-width:500px; margin:0 auto; font-size:15px; line-height:1.7; }
    .features { background:#000; padding:60px; text-align:center; }
    .features h2 { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; margin-bottom:40px; }
    .features-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; max-width:900px; margin:0 auto 40px; }
    .feature-card { background:#0d1422; border:1px solid rgba(59,130,246,0.1); border-radius:14px; padding:24px; text-align:left; }
    .f-icon { font-size:28px; margin-bottom:12px; }
    .feature-card h3 { font-size:15px; font-weight:700; margin-bottom:8px; }
    .feature-card p { color:#8899bb; font-size:13px; line-height:1.6; }
    .cta { background:#000; text-align:center; padding:60px; }
    .cta h2 { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; margin-bottom:28px; }
    .cta-btns { display:flex; gap:12px; justify-content:center; }
    .footer { background:#000; border-top:1px solid #1a2a40; padding:32px 60px; display:flex; justify-content:space-between; align-items:center; }
    .footer-brand { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#3b82f6; }
    .footer p { color:#4a5a7a; font-size:13px; }
    .btn-primary { background:#3b82f6; color:white; border:none; border-radius:10px; padding:11px 22px; font-weight:600; font-size:14px; cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
    .btn-primary:hover { background:#2563eb; }
    .btn-ghost { background:transparent; color:white; border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:11px 22px; font-weight:500; font-size:14px; cursor:pointer; text-decoration:none; display:inline-block; transition:all 0.2s; }
    .btn-ghost:hover { border-color:white; }
  `]
})
export class LandingComponent {
  features = [
    { icon: '🤝', title: 'Smart Matching', desc: 'AI-powered matching based on what you teach and want to learn.' },
    { icon: '💬', title: 'Built-in Chat', desc: 'Message matches and schedule sessions without leaving the platform.' },
    { icon: '📅', title: 'Calendar', desc: 'Book sessions and manage your schedule in one place.' },
    { icon: '🏆', title: 'Earn XP', desc: 'Level up, collect badges, and build your reputation as you grow.' }
  ];
}
