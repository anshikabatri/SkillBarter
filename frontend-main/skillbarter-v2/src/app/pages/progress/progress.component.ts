import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-progress', standalone: true, imports: [CommonModule, RouterLink],
template: `
<div class="prog-page">
  <div class="level-bar card">
    <div class="lb-left"><div class="lb-lbl">Your level</div><div class="lb-name">{{ levelName }} <span class="lb-num">{{ level }}</span></div></div>
    <div class="lb-mid"><div class="prog-track"><div class="prog-fill" [style.width]="xpPercent+'%'"></div></div><div class="xp-info">{{ xp }} / {{ nextXp }} XP</div></div>
    <div class="lb-right"><div class="lb-need">{{ nextXp - xp }} XP to reach</div><div class="lb-next">{{ nextLevelName }}</div></div>
  </div>
  <div class="body">
    <div class="card act-card">
      <div class="ch"><h2>Activity</h2></div>
      <div class="empty" *ngIf="sessions.length===0"><div class="ei">🏆</div><h3>No sessions yet</h3><p>Complete sessions to earn XP and level up.</p><a routerLink="/app/calendar" class="btn-primary">Schedule a session</a></div>
      <div *ngIf="sessions.length>0">
        <div class="sitem" *ngFor="let s of sessions.slice(0,5)">
          <div class="si-name">{{ s.skill?.name || 'Session' }}</div>
          <div class="si-time">{{ s.scheduledAt | date:'MMM d, y' }}</div>
          <span class="sbadge" [class]="(s.status||'').toLowerCase()">{{ s.status }}</span>
        </div>
      </div>
      <div class="stats">
        <div class="stat"><span>Total sessions</span><strong>{{ sessions.length }}</strong></div>
        <div class="stat"><span>Completed</span><strong>{{ completed }}</strong></div>
        <div class="stat"><span>XP earned</span><strong>{{ xp }}</strong></div>
      </div>
    </div>
    <div class="right-panel">
      <div class="card">
        <h2>Badges</h2>
        <div class="badges">
          <div class="badge" [class.unlocked]="completed>=1"><div class="bi">🎯</div><div class="bn">Initiator</div><div class="bd">{{ completed>=1?'Unlocked':'Complete 1 session' }}</div></div>
          <div class="badge" [class.unlocked]="completed>=5"><div class="bi">🔥</div><div class="bn">Connector</div><div class="bd">{{ completed>=5?'Unlocked':'Complete 5 sessions' }}</div></div>
          <div class="badge" [class.unlocked]="completed>=10"><div class="bi">⭐</div><div class="bn">Expert</div><div class="bd">{{ completed>=10?'Unlocked':'Complete 10 sessions' }}</div></div>
          <div class="badge" [class.unlocked]="sessions.length>=3"><div class="bi">🤝</div><div class="bn">Social</div><div class="bd">{{ sessions.length>=3?'Unlocked':'Connect with 3 people' }}</div></div>
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
</div>`,
styles:[`.prog-page{display:flex;flex-direction:column;gap:20px;max-width:1000px}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:22px}.level-bar{display:flex;align-items:center;gap:24px}.lb-lbl{font-size:12px;color:var(--text2);margin-bottom:4px}.lb-name{font-size:22px;font-weight:800;font-family:'Syne',sans-serif}.lb-num{font-size:40px;font-weight:900;margin-left:8px}.lb-mid{flex:1}.prog-track{height:6px;background:var(--bg3);border-radius:3px;margin-bottom:6px}.prog-fill{height:100%;background:linear-gradient(90deg,var(--blue),#8b5cf6);border-radius:3px;transition:width 0.5s}.xp-info{font-size:12px;color:var(--text2)}.lb-right{text-align:right}.lb-need{font-size:12px;color:var(--text2);margin-bottom:4px}.lb-next{font-size:18px;font-weight:700;font-family:'Syne',sans-serif}.body{display:flex;gap:20px;align-items:flex-start}.act-card{flex:1}.ch{margin-bottom:18px}.ch h2{font-size:18px;font-weight:700}.empty{text-align:center;padding:20px 0}.ei{font-size:32px;margin-bottom:10px}.empty h3{font-size:15px;font-weight:600;margin-bottom:6px}.empty p{color:var(--text2);font-size:13px;margin-bottom:16px}.empty a{text-decoration:none}.sitem{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border2)}.si-name{flex:1;font-size:14px;font-weight:500}.si-time{font-size:12px;color:var(--text2)}.sbadge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}.sbadge.completed,.sbadge.COMPLETED{background:rgba(16,185,129,0.15);color:var(--green)}.sbadge.scheduled,.sbadge.SCHEDULED{background:rgba(59,130,246,0.15);color:var(--blue)}.stats{display:flex;gap:16px;border-top:1px solid var(--border2);padding-top:14px;margin-top:14px}.stat{flex:1}.stat span{display:block;font-size:12px;color:var(--text2);margin-bottom:4px}.stat strong{font-size:22px;font-weight:800;font-family:'Syne',sans-serif}.right-panel{width:280px;display:flex;flex-direction:column;gap:16px}.right-panel h2{font-size:17px;font-weight:700;margin-bottom:14px}.badges{display:grid;grid-template-columns:1fr 1fr;gap:10px}.badge{background:var(--bg3);border-radius:10px;padding:14px;text-align:center;opacity:0.5;border:1px solid var(--border2)}.badge.unlocked{opacity:1;border-color:var(--blue);background:var(--blue-glow)}.bi{font-size:24px;margin-bottom:6px}.bn{font-size:13px;font-weight:700;margin-bottom:3px}.bd{font-size:11px;color:var(--text2)}.goals-card h2{font-size:17px;font-weight:700;margin-bottom:14px}.goal{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.g-icon{font-size:20px}.g-name{font-size:14px;font-weight:600;margin-bottom:2px}.g-desc{font-size:12px;color:var(--text2)}`]
})
export class ProgressComponent implements OnInit {
  sessions:any[]=[]; xp=0; level=1; levelName='Newcomer'; nextLevelName='Apprentice'; nextXp=400;
  get xpPercent(){return Math.min(100,(this.xp/this.nextXp)*100);}
  get completed(){return this.sessions.filter(s=>['completed','COMPLETED'].includes((s.status||'').toLowerCase())).length;}
  goals=[{icon:'🎯',name:'Earn "Initiator"',desc:'Complete your first session'},{icon:'⬆️',name:'Reach Level 2',desc:`${400} XP needed`},{icon:'🤝',name:'Connect with 5 people',desc:'Build your network'}];
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    const u=this.auth.currentUser;
    if(u){this.xp=u.xpPoints||u.skillPoints||0;this.updateLevel();if(u.userId){this.api.getSessionsByLearner(u.userId).subscribe({next:d=>{this.sessions=d||[];this.api.getSessionsByMentor(u.userId!).subscribe({next:d2=>{this.sessions=[...this.sessions,...(d2||[])];},error:()=>{}});},error:()=>{}});}}
  }
  updateLevel(){const lvls=[{l:1,n:'Newcomer',xp:0,next:400,nn:'Apprentice'},{l:2,n:'Apprentice',xp:400,next:1000,nn:'Practitioner'},{l:3,n:'Practitioner',xp:1000,next:2500,nn:'Expert'},{l:4,n:'Expert',xp:2500,next:5000,nn:'Master'}];const cur=lvls.filter(l=>this.xp>=l.xp).pop()||lvls[0];this.level=cur.l;this.levelName=cur.n;this.nextXp=cur.next;this.nextLevelName=cur.nn;}
}
