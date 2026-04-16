import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-progress', standalone: true, imports: [CommonModule, RouterLink],
template: `
<div class="prog-page">
  <div class="card loading-card" *ngIf="loading">Loading progress...</div>
  <div class="card error-card" *ngIf="!loading && errorMsg">{{ errorMsg }}</div>

  <ng-container *ngIf="!loading && !errorMsg">
  <div class="level-bar card">
    <div class="lb-left"><div class="lb-lbl">Your level</div><div class="lb-name">{{ levelName }} <span class="lb-num">{{ level }}</span></div></div>
    <div class="lb-mid"><div class="prog-track"><div class="prog-fill" [style.width]="xpPercent+'%'"></div></div><div class="xp-info">{{ xp }} XP total • {{ xpIntoLevel }} / {{ xpNeededForNextLevel }} XP in this level</div></div>
    <div class="lb-right"><div class="lb-need">{{ xpToNext }} XP to reach</div><div class="lb-next">{{ nextLevelName }}</div></div>
  </div>
  <div class="body">
    <div class="card act-card">
      <div class="ch"><h2>Activity</h2></div>
      <div class="empty" *ngIf="sessions.length===0"><div class="ei">🏆</div><h3>No sessions yet</h3><p>Complete sessions to earn XP and level up.</p><a routerLink="/app/calendar" class="btn-primary">Schedule a session</a></div>
      <div *ngIf="sessions.length>0">
        <div class="sitem" *ngFor="let s of sessions.slice(0,5)">
          <div class="si-name">{{ s.skill?.name || 'Session' }} <span class="si-peer">with {{ getPeerName(s) }}</span></div>
          <div class="si-time">{{ s.scheduledAt | date:'MMM d, y • h:mm a' }}</div>
          <span class="sbadge" [class]="(s.status||'').toLowerCase()">{{ s.status }}</span>
        </div>
      </div>
      <div class="stats">
        <div class="stat"><span>Total sessions</span><strong>{{ sessions.length }}</strong></div>
        <div class="stat"><span>Completed</span><strong>{{ completed }}</strong></div>
        <div class="stat"><span>Completion rate</span><strong>{{ completionRate }}%</strong></div>
      </div>
    </div>
    <div class="right-panel">
      <div class="card">
        <h2>Ratings</h2>
        <div class="rating-main">{{ avgRating | number:'1.1-1' }} <span>/ 5</span></div>
        <div class="rating-sub">{{ reviewCount }} {{ reviewCount===1 ? 'review' : 'reviews' }} received</div>
      </div>
      <div class="card">
        <h2>Badges</h2>
        <div class="badges">
          <div class="badge" *ngFor="let b of badges" [class.unlocked]="b.unlocked"><div class="bi">{{ b.icon }}</div><div class="bn">{{ b.name }}</div><div class="bd">{{ b.text }}</div></div>
        </div>
      </div>
      <div class="card goals-card">
        <h2>Next Goals</h2>
        <div class="goal" *ngFor="let g of goals">
          <div class="g-icon">{{ g.icon }}</div>
          <div><div class="g-name">{{ g.name }}</div><div class="g-desc">{{ g.desc }}</div></div>
        </div>
      </div>
    </div>
  </div>
</ng-container>
</div>`,
styles:[`.prog-page{display:flex;flex-direction:column;gap:20px;max-width:1000px}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:22px}.loading-card,.error-card{font-size:14px;color:var(--text2)}.error-card{color:var(--red)}.level-bar{display:flex;align-items:center;gap:24px}.lb-lbl{font-size:12px;color:var(--text2);margin-bottom:4px}.lb-name{font-size:22px;font-weight:800;font-family:'Syne',sans-serif}.lb-num{font-size:40px;font-weight:900;margin-left:8px}.lb-mid{flex:1}.prog-track{height:6px;background:var(--bg3);border-radius:3px;margin-bottom:6px}.prog-fill{height:100%;background:linear-gradient(90deg,var(--blue),#8b5cf6);border-radius:3px;transition:width 0.5s}.xp-info{font-size:12px;color:var(--text2)}.lb-right{text-align:right}.lb-need{font-size:12px;color:var(--text2);margin-bottom:4px}.lb-next{font-size:18px;font-weight:700;font-family:'Syne',sans-serif}.body{display:flex;gap:20px;align-items:flex-start}.act-card{flex:1}.ch{margin-bottom:18px}.ch h2{font-size:18px;font-weight:700}.empty{text-align:center;padding:20px 0}.ei{font-size:32px;margin-bottom:10px}.empty h3{font-size:15px;font-weight:600;margin-bottom:6px}.empty p{color:var(--text2);font-size:13px;margin-bottom:16px}.empty a{text-decoration:none}.sitem{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border2)}.si-name{flex:1;font-size:14px;font-weight:500}.si-peer{font-size:12px;color:var(--text2);font-weight:400}.si-time{font-size:12px;color:var(--text2)}.sbadge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}.sbadge.completed,.sbadge.COMPLETED{background:rgba(16,185,129,0.15);color:var(--green)}.sbadge.scheduled,.sbadge.SCHEDULED{background:rgba(59,130,246,0.15);color:var(--blue)}.sbadge.cancelled,.sbadge.CANCELLED{background:rgba(239,68,68,0.15);color:var(--red)}.stats{display:flex;gap:16px;border-top:1px solid var(--border2);padding-top:14px;margin-top:14px}.stat{flex:1}.stat span{display:block;font-size:12px;color:var(--text2);margin-bottom:4px}.stat strong{font-size:22px;font-weight:800;font-family:'Syne',sans-serif}.right-panel{width:280px;display:flex;flex-direction:column;gap:16px}.right-panel h2{font-size:17px;font-weight:700;margin-bottom:14px}.rating-main{font-size:30px;font-weight:800;font-family:'Syne',sans-serif;color:var(--blue)}.rating-main span{font-size:14px;color:var(--text2);font-family:inherit;font-weight:600}.rating-sub{font-size:12px;color:var(--text2)}.badges{display:grid;grid-template-columns:1fr 1fr;gap:10px}.badge{background:var(--bg3);border-radius:10px;padding:14px;text-align:center;opacity:0.5;border:1px solid var(--border2)}.badge.unlocked{opacity:1;border-color:var(--blue);background:var(--blue-glow)}.bi{font-size:24px;margin-bottom:6px}.bn{font-size:13px;font-weight:700;margin-bottom:3px}.bd{font-size:11px;color:var(--text2)}.goals-card h2{font-size:17px;font-weight:700;margin-bottom:14px}.goal{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.g-icon{font-size:20px}.g-name{font-size:14px;font-weight:600;margin-bottom:2px}.g-desc{font-size:12px;color:var(--text2)}`]
})
export class ProgressComponent implements OnInit {
  loading = true;
  errorMsg = '';
  userId?: number;
  sessions:any[]=[];
  xp=0;
  level=1;
  levelName='Newcomer';
  nextLevelName='Apprentice';
  nextXp=400;
  currentLevelFloor=0;
  avgRating=0;
  reviewCount=0;

  levels=[
    {l:1,n:'Newcomer',xp:0,next:400,nn:'Apprentice'},
    {l:2,n:'Apprentice',xp:400,next:1000,nn:'Practitioner'},
    {l:3,n:'Practitioner',xp:1000,next:2500,nn:'Expert'},
    {l:4,n:'Expert',xp:2500,next:5000,nn:'Master'},
    {l:5,n:'Master',xp:5000,next:5000,nn:'Master'}
  ];

  get completed(){return this.sessions.filter(s=>(s.status||'').toLowerCase()==='completed').length;}
  get xpIntoLevel(){return Math.max(0, this.xp - this.currentLevelFloor);}
  get xpNeededForNextLevel(){return Math.max(1, this.nextXp - this.currentLevelFloor);}
  get xpPercent(){return Math.min(100, Math.round((this.xpIntoLevel / this.xpNeededForNextLevel) * 100));}
  get xpToNext(){return Math.max(0, this.nextXp - this.xp);}
  get completionRate(){
    if (!this.sessions.length) return 0;
    return Math.round((this.completed / this.sessions.length) * 100);
  }
  get uniqueConnections(){
    const ids = new Set<number>();
    this.sessions.forEach(s => {
      const mentorId = s?.mentor?.userId;
      const learnerId = s?.learner?.userId;
      if (mentorId && mentorId !== this.userId) ids.add(mentorId);
      if (learnerId && learnerId !== this.userId) ids.add(learnerId);
    });
    return ids.size;
  }

  get goals(){
    return [
      { icon:'🎯', name:'Complete 1 session', desc: this.completed >= 1 ? 'Done' : `${1 - this.completed} session to go` },
      { icon:'⬆️', name:`Reach ${this.nextLevelName}`, desc: this.xpToNext === 0 ? 'Done' : `${this.xpToNext} XP needed` },
      { icon:'🤝', name:'Connect with 5 people', desc: this.uniqueConnections >= 5 ? 'Done' : `${5 - this.uniqueConnections} more connections` },
      { icon:'📝', name:'Receive 3 reviews', desc: this.reviewCount >= 3 ? 'Done' : `${3 - this.reviewCount} more reviews` }
    ];
  }

  get badges(){
    return [
      { icon:'🎯', name:'Initiator', unlocked:this.completed>=1, text: this.completed>=1 ? 'Unlocked' : 'Complete 1 session' },
      { icon:'🔥', name:'Connector', unlocked:this.completed>=5, text: this.completed>=5 ? 'Unlocked' : `${Math.max(0,5-this.completed)} sessions left` },
      { icon:'⭐', name:'Expert', unlocked:this.completed>=10, text: this.completed>=10 ? 'Unlocked' : `${Math.max(0,10-this.completed)} sessions left` },
      { icon:'🤝', name:'Networker', unlocked:this.uniqueConnections>=5, text: this.uniqueConnections>=5 ? 'Unlocked' : `${Math.max(0,5-this.uniqueConnections)} connections left` },
      { icon:'🏅', name:'Top Rated', unlocked:this.reviewCount>=3 && this.avgRating>=4.5, text: (this.reviewCount>=3 && this.avgRating>=4.5) ? 'Unlocked' : 'Need 4.5+ rating (min 3 reviews)' }
    ];
  }

  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    const existing = this.auth.currentUser;
    if (existing?.userId) {
      this.userId = existing.userId;
      this.loadAll(existing.userId);
      return;
    }

    if (!this.auth.isLoggedIn) {
      this.loading = false;
      this.errorMsg = 'Please login to view your progress.';
      return;
    }

    this.auth.resolveAndStoreCurrentUser().subscribe({
      next: (u) => {
        if (!u?.userId) {
          this.loading = false;
          this.errorMsg = 'Unable to resolve your profile.';
          return;
        }
        this.userId = u.userId;
        this.loadAll(u.userId);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Unable to load your progress right now.';
      }
    });
  }

  loadAll(userId: number) {
    this.loading = true;
    this.errorMsg = '';

    this.api.getUser(userId).subscribe({
      next: (u: any) => {
        this.xp = Number(u?.xp ?? u?.xpPoints ?? u?.skillPoints ?? 0) || 0;
        this.updateLevel();
      },
      error: () => {
        const u = this.auth.currentUser;
        this.xp = Number(u?.xp ?? u?.xpPoints ?? u?.skillPoints ?? 0) || 0;
        this.updateLevel();
      }
    });

    this.api.getSessionsByLearner(userId).subscribe({
      next: d => {
        const learner = d || [];
        this.api.getSessionsByMentor(userId).subscribe({
          next: d2 => {
            const combined = [...learner, ...(d2 || [])];
            const unique = Array.from(new Map(combined.map((s: any) => [s.sessionId, s])).values());
            this.sessions = unique.sort((a: any, b: any) => new Date(b?.scheduledAt || 0).getTime() - new Date(a?.scheduledAt || 0).getTime());
            this.loading = false;
          },
          error: () => {
            this.sessions = learner;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.sessions = [];
        this.loading = false;
      }
    });

    this.api.getReviewsByReviewee(userId).subscribe({
      next: (reviews: any[]) => {
        this.reviewCount = (reviews || []).length;
      },
      error: () => {
        this.reviewCount = 0;
      }
    });

    this.api.getAverageRating(userId).subscribe({
      next: (avg: number) => {
        this.avgRating = Number(avg || 0);
      },
      error: () => {
        this.avgRating = 0;
      }
    });
  }

  getPeerName(s: any) {
    if (!s) return 'Peer';
    if (s?.mentor?.userId === this.userId) return s?.learner?.name || 'Learner';
    return s?.mentor?.name || 'Mentor';
  }

  updateLevel(){
    const cur=this.levels.filter(l=>this.xp>=l.xp).pop()||this.levels[0];
    this.level=cur.l;
    this.levelName=cur.n;
    this.nextXp=cur.next;
    this.nextLevelName=cur.nn;
    this.currentLevelFloor=cur.xp;
  }
}
