import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({ selector: 'app-calendar', standalone: true, imports: [CommonModule, FormsModule],
template: `
<div class="cal-page">
  <div class="card cal-card">
    <div class="calh"><button class="cn" (click)="prev()">‹</button><span class="ct">{{ ms[cm] }} {{ cy }}</span><button class="cn" (click)="next()">›</button></div>
    <div class="cg">
      <div class="dn" *ngFor="let d of dns">{{ d }}</div>
      <div *ngFor="let d of days" class="cd" [class.today]="isTd(d)" [class.other]="!d.c">{{ d.d||'' }}</div>
    </div>
    <button class="btn-primary new-btn" (click)="toggleRequestForm()">+ New Session Request</button>

    <div class="req-box" *ngIf="showRequest">
      <h4>Create Session Request</h4>
      <div class="req-grid">
        <select class="input" [(ngModel)]="request.mentorId" (change)="onMentorChange()">
          <option [ngValue]="null">Select match</option>
          <option *ngFor="let m of requestMatches" [ngValue]="m.userId">{{ m.name }}</option>
        </select>

        <select class="input" [(ngModel)]="request.skillId" [disabled]="!request.mentorId">
          <option [ngValue]="null">Select skill</option>
          <option *ngFor="let s of mentorSkills" [ngValue]="s.skillId">{{ s.name }}{{ s.kind ? ' (' + s.kind + ')' : '' }}</option>
        </select>

        <input class="input" type="datetime-local" [(ngModel)]="request.scheduledAt">
      </div>

      <div class="req-actions">
        <button class="btn-primary" (click)="submitRequest()" [disabled]="submitting">{{ submitting ? 'Creating...' : 'Create Request' }}</button>
        <button class="btn-secondary" (click)="showRequest=false">Cancel</button>
      </div>
      <div class="loading" *ngIf="loadingRequestData">Loading matches/skills...</div>
      <div class="empty" *ngIf="requestError">{{ requestError }}</div>
      <div class="success" *ngIf="requestSuccess">{{ requestSuccess }}</div>
    </div>
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
        <div class="si-with">with {{ withUser(s) }}</div>
      </div>
      <button class="ack-btn" *ngIf="tab==='upcoming' && ((s.status||'').toLowerCase()==='scheduled')"
              [disabled]="completingSessionId===s.sessionId"
              (click)="markComplete(s)">
        {{ completingSessionId===s.sessionId ? 'Saving...' : 'Mark as Complete' }}
      </button>
      <span class="sbadge" [class]="(s.status||'').toLowerCase()">{{ s.status }}</span>
    </div>
    <div class="success" *ngIf="statusSuccess">{{ statusSuccess }}</div>
    <div class="empty" *ngIf="statusError">{{ statusError }}</div>
  </div>
</div>`,
styles: [`.cal-page{display:flex;gap:20px;align-items:flex-start}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:22px}.cal-card{flex:1}.calh{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.ct{font-size:16px;font-weight:700;font-family:'Syne',sans-serif}.cn{background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer}.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:20px}.dn{text-align:center;font-size:11px;color:var(--text3);padding:6px 0;font-weight:600}.cd{text-align:center;padding:9px 2px;border-radius:8px;font-size:14px;cursor:pointer;transition:background 0.15s}.cd:hover:not(.other){background:var(--bg3)}.cd.today{background:var(--blue);color:white;border-radius:50%;font-weight:700}.cd.other{color:var(--text3)}.new-btn{display:block;text-align:center;width:100%;padding:13px;border-radius:10px;text-decoration:none}.req-box{margin-top:14px;border:1px solid var(--border2);border-radius:12px;padding:14px;background:var(--bg3)}.req-box h4{font-size:14px;font-weight:700;margin-bottom:10px}.req-grid{display:grid;grid-template-columns:1fr;gap:10px}.req-actions{display:flex;gap:8px;margin-top:10px}.btn-secondary{padding:10px 14px;border-radius:8px;border:1px solid var(--border2);background:transparent;color:var(--text2);cursor:pointer}.success{color:var(--green);font-size:13px;padding-top:8px}.sess-card{width:300px}.stabs{display:flex;gap:6px;margin-bottom:18px}.stabs button{padding:7px 16px;border-radius:8px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-size:13px;cursor:pointer}.stabs button.active{background:var(--blue);color:white;border-color:var(--blue)}.loading,.empty{color:var(--text2);font-size:13px;padding:12px 0}.sitem{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--border2)}.si-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}.si-dot.scheduled,.si-dot.SCHEDULED{background:var(--blue)}.si-dot.completed,.si-dot.COMPLETED{background:var(--green)}.si-dot.cancelled,.si-dot.CANCELLED{background:var(--red)}.si-info{flex:1}.si-name{font-size:14px;font-weight:600;margin-bottom:3px}.si-time,.si-with{font-size:12px;color:var(--text2)}.ack-btn{border:1px solid var(--green);background:rgba(16,185,129,0.15);color:var(--green);font-size:11px;font-weight:700;padding:5px 8px;border-radius:8px;cursor:pointer;align-self:center;white-space:nowrap}.ack-btn:disabled{opacity:0.6;cursor:not-allowed}.sbadge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}.sbadge.scheduled,.sbadge.SCHEDULED{background:rgba(59,130,246,0.15);color:var(--blue)}.sbadge.completed,.sbadge.COMPLETED{background:rgba(16,185,129,0.15);color:var(--green)}.sbadge.cancelled,.sbadge.CANCELLED{background:rgba(239,68,68,0.15);color:var(--red)}`]
})
export class CalendarComponent implements OnInit {
  dns=['Su','Mo','Tu','We','Th','Fr','Sa']; ms=['January','February','March','April','May','June','July','August','September','October','November','December'];
  cm=new Date().getMonth(); cy=new Date().getFullYear(); today=new Date(); days:any[]=[];
  sessions:any[]=[]; tab='upcoming'; loading=true;
  userId: number | null = null;
  showRequest = false;
  loadingRequestData = false;
  submitting = false;
  requestMatches: any[] = [];
  mentorSkills: any[] = [];
  request = { mentorId: null as number | null, skillId: null as number | null, scheduledAt: '' };
  requestError = '';
  requestSuccess = '';
  completingSessionId: number | null = null;
  statusSuccess = '';
  statusError = '';
  get filtered(){return this.sessions.filter(s=>this.tab==='upcoming'?(s.status||'').toLowerCase()==='scheduled':['completed','cancelled'].includes((s.status||'').toLowerCase()));}
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    this.buildCal();
    const u = this.auth.currentUser;
    if (u?.userId) {
      this.userId = u.userId;
      this.load(u.userId);
      return;
    }
    if (this.auth.isLoggedIn) {
      this.auth.resolveAndStoreCurrentUser().subscribe({
        next: user => {
          this.userId = user.userId;
          this.load(user.userId);
        },
        error: () => { this.loading = false; }
      });
      return;
    }
    this.loading = false;
  }
  load(id:number){
    this.loading=true;
    forkJoin({
      learner: this.api.getSessionsByLearner(id),
      mentor: this.api.getSessionsByMentor(id)
    }).subscribe({
      next: ({ learner, mentor }) => {
        const all = [...(learner||[]), ...(mentor||[])];
        const deduped = all.filter((s, i, arr) => arr.findIndex(x => x.sessionId === s.sessionId) === i);
        this.sessions = deduped.sort((a:any, b:any) =>
          new Date(a?.scheduledAt || 0).getTime() - new Date(b?.scheduledAt || 0).getTime()
        );
        this.loading = false;
      },
      error: () => this.loading=false
    });
  }
  withUser(s:any){
    if (!s) return 'Unknown';
    if (!this.userId) return s?.mentor?.name || s?.learner?.name || 'Unknown';
    return s?.mentor?.userId===this.userId ? (s?.learner?.name || 'Learner') : (s?.mentor?.name || 'Mentor');
  }
  toggleRequestForm(){
    this.showRequest = !this.showRequest;
    this.requestError = '';
    this.requestSuccess = '';
    if (this.showRequest && this.requestMatches.length === 0) this.loadRequestMatches();
  }
  loadRequestMatches(){
    if (!this.userId) return;
    this.loadingRequestData = true;
    this.api.getMatchesByUser(this.userId).subscribe({
      next: (matches:any[]) => {
        const meId = Number(this.userId);
        this.requestMatches = (matches||[])
          .map((m:any) => {
            const user1Id = Number(m?.user1?.userId);
            const user2Id = Number(m?.user2?.userId);
            const other = user1Id === meId ? m?.user2 : m?.user1;
            return other && Number(other?.userId) !== meId ? other : null;
          })
          .filter((u:any) => !!u?.userId)
          .filter((u:any, i:number, arr:any[]) => arr.findIndex(x => Number(x.userId) === Number(u.userId)) === i);
        this.loadingRequestData = false;
      },
      error: () => {
        this.requestError = 'Unable to load your matches.';
        this.loadingRequestData = false;
      }
    });
  }
  onMentorChange(){
    this.request.skillId = null;
    this.mentorSkills = [];
    if (!this.request.mentorId) return;
    this.loadingRequestData = true;
    this.api.getUserSkills(this.request.mentorId).subscribe({
      next: (skills:any[]) => {
        this.mentorSkills = (skills||[])
          .filter((us:any) => !!us?.skill?.skillId)
          .map((us:any) => ({
            skillId: us.skill.skillId,
            name: us.skill.name,
            kind: (us?.isTeach === true || us?.isTeach === 'true' || us?.isTeach === 1 || us?.isTeach === '1')
              ? 'Teach'
              : ((us?.isLearn === true || us?.isLearn === 'true' || us?.isLearn === 1 || us?.isLearn === '1') ? 'Learn' : '')
          }))
          .filter((s:any, i:number, arr:any[]) => arr.findIndex(x => x.skillId === s.skillId) === i);
        this.loadingRequestData = false;
      },
      error: () => {
        this.requestError = 'Unable to load skills for selected match.';
        this.loadingRequestData = false;
      }
    });
  }
  submitRequest(){
    this.requestError = '';
    this.requestSuccess = '';
    if (!this.userId) { this.requestError = 'Please login again.'; return; }
    if (!this.request.mentorId || !this.request.skillId || !this.request.scheduledAt) { this.requestError = 'Please fill all fields.'; return; }
    this.submitting = true;
    this.api.createSession({
      mentor: { userId: this.request.mentorId },
      learner: { userId: this.userId },
      skill: { skillId: this.request.skillId },
      scheduledAt: this.request.scheduledAt
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.requestSuccess = 'Session request created successfully.';
        this.request = { mentorId: null, skillId: null, scheduledAt: '' };
        this.mentorSkills = [];
        this.load(this.userId!);
      },
      error: (e:any) => {
        this.submitting = false;
        this.requestError = e?.error?.message || 'Failed to create session request.';
      }
    });
  }

  markComplete(session: any){
    this.statusError = '';
    this.statusSuccess = '';
    const id = Number(session?.sessionId);
    if (!id) return;
    if (!confirm('Mark this session as completed? Both users will receive XP.')) return;

    this.completingSessionId = id;
    this.api.updateSessionStatus(id, 'Completed').subscribe({
      next: () => {
        this.statusSuccess = 'Session completed. +50 XP awarded.';
        if (this.userId) {
          this.api.getUser(this.userId).subscribe({
            next: (u:any) => this.auth.setUser(u),
            error: () => {}
          });
        }
        if (this.userId) this.load(this.userId);
        this.completingSessionId = null;
      },
      error: (e:any) => {
        this.statusError = e?.error?.message || 'Failed to update session status.';
        this.completingSessionId = null;
      }
    });
  }

  buildCal(){const f=new Date(this.cy,this.cm,1),l=new Date(this.cy,this.cm+1,0);const d:any[]=[];for(let i=0;i<f.getDay();i++)d.push({d:'',c:false});for(let x=1;x<=l.getDate();x++)d.push({d:x,c:true});const r=7-(d.length%7);if(r<7)for(let i=1;i<=r;i++)d.push({d:i,c:false});this.days=d;}
  isTd(d:any){return d.c&&d.d===this.today.getDate()&&this.cm===this.today.getMonth()&&this.cy===this.today.getFullYear();}
  prev(){if(this.cm===0){this.cm=11;this.cy--;}else this.cm--;this.buildCal();}
  next(){if(this.cm===11){this.cm=0;this.cy++;}else this.cm++;this.buildCal();}
}
