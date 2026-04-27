import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css'
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
