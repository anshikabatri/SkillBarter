import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-calendar', standalone: true, imports: [CommonModule, RouterLink],
template: `
<div class="cal-page">
  <div class="card cal-card">
    <div class="calh"><button class="cn" (click)="prev()">‹</button><span class="ct">{{ ms[cm] }} {{ cy }}</span><button class="cn" (click)="next()">›</button></div>
    <div class="cg">
      <div class="dn" *ngFor="let d of dns">{{ d }}</div>
      <div *ngFor="let d of days" class="cd" [class.today]="isTd(d)" [class.other]="!d.c">{{ d.d||'' }}</div>
    </div>
    <a routerLink="/app/matches" class="btn-primary new-btn">+ New Session Request</a>
  </div>
  <div class="card sess-card">
    <div class="stabs">
      <button [class.active]="tab==='upcoming'" (click)="tab='upcoming'">Upcoming</button>
      <button [class.active]="tab==='history'" (click)="tab='history'">History</button>
    </div>
    <div class="loading" *ngIf="loading">Loading...</div>
    <div class="empty" *ngIf="!loading&&filtered.length===0">No {{ tab }} sessions.</div>
    <div class="sitem" *ngFor="let s of filtered">
      <div class="si-dot" [class]="(s.status||'').toLowerCase()"></div>
      <div class="si-info">
        <div class="si-name">{{ s.skill?.name || 'Session' }}</div>
        <div class="si-time">{{ s.scheduledAt | date:'MMM d, y · h:mm a' }}</div>
        <div class="si-with">with {{ s.mentor?.name || s.learner?.name }}</div>
      </div>
      <span class="sbadge" [class]="(s.status||'').toLowerCase()">{{ s.status }}</span>
    </div>
  </div>
</div>`,
styles: [`.cal-page{display:flex;gap:20px;align-items:flex-start}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:22px}.cal-card{flex:1}.calh{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.ct{font-size:16px;font-weight:700;font-family:'Syne',sans-serif}.cn{background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer}.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:20px}.dn{text-align:center;font-size:11px;color:var(--text3);padding:6px 0;font-weight:600}.cd{text-align:center;padding:9px 2px;border-radius:8px;font-size:14px;cursor:pointer;transition:background 0.15s}.cd:hover:not(.other){background:var(--bg3)}.cd.today{background:var(--blue);color:white;border-radius:50%;font-weight:700}.cd.other{color:var(--text3)}.new-btn{display:block;text-align:center;width:100%;padding:13px;border-radius:10px;text-decoration:none}.sess-card{width:300px}.stabs{display:flex;gap:6px;margin-bottom:18px}.stabs button{padding:7px 16px;border-radius:8px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-size:13px;cursor:pointer}.stabs button.active{background:var(--blue);color:white;border-color:var(--blue)}.loading,.empty{color:var(--text2);font-size:13px;padding:12px 0}.sitem{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--border2)}.si-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}.si-dot.scheduled,.si-dot.SCHEDULED{background:var(--blue)}.si-dot.completed,.si-dot.COMPLETED{background:var(--green)}.si-dot.cancelled,.si-dot.CANCELLED{background:var(--red)}.si-info{flex:1}.si-name{font-size:14px;font-weight:600;margin-bottom:3px}.si-time,.si-with{font-size:12px;color:var(--text2)}.sbadge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}.sbadge.scheduled,.sbadge.SCHEDULED{background:rgba(59,130,246,0.15);color:var(--blue)}.sbadge.completed,.sbadge.COMPLETED{background:rgba(16,185,129,0.15);color:var(--green)}.sbadge.cancelled,.sbadge.CANCELLED{background:rgba(239,68,68,0.15);color:var(--red)}`]
})
export class CalendarComponent implements OnInit {
  dns=['Su','Mo','Tu','We','Th','Fr','Sa']; ms=['January','February','March','April','May','June','July','August','September','October','November','December'];
  cm=new Date().getMonth(); cy=new Date().getFullYear(); today=new Date(); days:any[]=[];
  sessions:any[]=[]; tab='upcoming'; loading=true;
  get filtered(){return this.sessions.filter(s=>this.tab==='upcoming'?['scheduled','SCHEDULED'].includes((s.status||'').toLowerCase()):['completed','COMPLETED','cancelled','CANCELLED'].includes((s.status||'').toLowerCase()));}
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){this.buildCal();const u=this.auth.currentUser;if(u?.userId)this.load(u.userId);}
  load(id:number){this.loading=true;this.api.getSessionsByLearner(id).subscribe({next:d=>{this.sessions=d||[];this.api.getSessionsByMentor(id).subscribe({next:d2=>{this.sessions=[...this.sessions,...(d2||[])];this.loading=false;},error:()=>this.loading=false});},error:()=>this.loading=false});}
  buildCal(){const f=new Date(this.cy,this.cm,1),l=new Date(this.cy,this.cm+1,0);const d:any[]=[];for(let i=0;i<f.getDay();i++)d.push({d:'',c:false});for(let x=1;x<=l.getDate();x++)d.push({d:x,c:true});const r=7-(d.length%7);if(r<7)for(let i=1;i<=r;i++)d.push({d:i,c:false});this.days=d;}
  isTd(d:any){return d.c&&d.d===this.today.getDate()&&this.cm===this.today.getMonth()&&this.cy===this.today.getFullYear();}
  prev(){if(this.cm===0){this.cm=11;this.cy--;}else this.cm--;this.buildCal();}
  next(){if(this.cm===11){this.cm=0;this.cy++;}else this.cm++;this.buildCal();}
}
