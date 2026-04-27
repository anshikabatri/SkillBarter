import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
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
  reviewedSessionIds = new Set<number>();
  get minScheduledAt(): string {
    const now = new Date();
    now.setSeconds(0, 0);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
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
        this.loadReviewStates();
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

  private isRequester(s: any): boolean {
    return Number(s?.learner?.userId) === Number(this.userId);
  }

  canRate(s: any): boolean {
    return this.tab === 'history'
      && (s?.status || '').toLowerCase() === 'completed'
      && this.isRequester(s)
      && !this.reviewedSessionIds.has(Number(s?.sessionId));
  }

  private loadReviewStates() {
    if (!this.userId) return;
    const candidates = this.sessions.filter((s: any) => (s?.status || '').toLowerCase() === 'completed' && this.isRequester(s));
    if (!candidates.length) {
      this.reviewedSessionIds = new Set<number>();
      return;
    }
    forkJoin(
      candidates.map((s: any) => this.api.hasReviewedSession(Number(s.sessionId), Number(this.userId)))
    ).subscribe({
      next: (flags: boolean[]) => {
        const set = new Set<number>();
        candidates.forEach((s: any, idx: number) => {
          if (flags[idx]) set.add(Number(s.sessionId));
        });
        this.reviewedSessionIds = set;
      },
      error: () => {}
    });
  }

  rateSession(session: any) {
    if (!this.userId) return;
    const sessionId = Number(session?.sessionId);
    const revieweeId = Number(session?.mentor?.userId);
    if (!sessionId || !revieweeId) return;

    const ratingInput = prompt('Rate this session (1.0 to 5.0):', '5');
    if (ratingInput === null) return;
    const rating = Number(ratingInput);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      this.statusError = 'Please enter a rating between 1 and 5.';
      return;
    }

    const reviewText = prompt('Write a short review (optional):', '') || '';

    this.statusError = '';
    this.statusSuccess = '';
    this.api.addReview(this.userId, revieweeId, rating, reviewText, sessionId).subscribe({
      next: () => {
        this.reviewedSessionIds.add(sessionId);
        this.statusSuccess = 'Thanks! Your review was submitted.';
      },
      error: (e: any) => {
        this.statusError = e?.error?.message || 'Unable to submit review.';
      }
    });
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

    const selectedDate = new Date(this.request.scheduledAt);
    if (Number.isNaN(selectedDate.getTime())) {
      this.requestError = 'Please enter a valid session date and time.';
      return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      this.requestError = 'Session time is in the past. Please choose a future date and time.';
      return;
    }

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
