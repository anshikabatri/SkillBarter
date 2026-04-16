import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({ selector: 'app-profile', standalone: true, imports: [CommonModule, FormsModule],
template:`
<div class="profile-page">
  <div class="card profile-card">
    <div class="pav-section">
      <div class="pav" [style.background]="gc(form.name)">{{ form.name.charAt(0)||'U' }}</div>
      <div class="pav-name">{{ form.name }}</div>
      <div class="pav-email">{{ user?.email }}</div>
    </div>
    <div class="pform">
      <div class="fg"><label>Your Name</label><input [(ngModel)]="form.name" class="input" placeholder="Full name"></div>
      <div class="fg"><label>Profile Description</label><textarea [(ngModel)]="form.bio" class="input ta" placeholder="Tell others about yourself..."></textarea></div>

      <div class="skills-wrap">
        <div class="skills-col">
          <label>Skills I Have (Teach)</label>
          <div class="tags">
            <span class="tag" *ngFor="let s of teachSkills">{{ s.skill?.name || s.name }}</span>
            <span class="empty-sm" *ngIf="teachSkills.length===0">No skills added yet.</span>
          </div>
          <div class="add-row">
            <input [(ngModel)]="newTeachSkill" class="input" placeholder="Type skill name (e.g. Angular)">
            <button class="btn-primary" (click)="addSkill(true)" [disabled]="addingSkill">Add</button>
          </div>
        </div>

        <div class="skills-col">
          <label>Skills I Need to Learn</label>
          <div class="tags">
            <span class="tag learn" *ngFor="let s of learnSkills">{{ s.skill?.name || s.name }}</span>
            <span class="empty-sm" *ngIf="learnSkills.length===0">No skills added yet.</span>
          </div>
          <div class="add-row">
            <input [(ngModel)]="newLearnSkill" class="input" placeholder="Type skill name (e.g. Spring Boot)">
            <button class="btn-primary" (click)="addSkill(false)" [disabled]="addingSkill">Add</button>
          </div>
        </div>
      </div>

      <div class="success-box" *ngIf="saved">✓ Profile saved successfully!</div>
      <div class="error-box" *ngIf="error">{{ error }}</div>
      <div class="pactions">
        <button class="btn-primary" (click)="save()" [disabled]="saving">{{ saving?'Saving...':'Save Profile' }}</button>
      </div>
    </div>
  </div>
</div>`,
styles:[`.profile-page{max-width:920px}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:32px}.profile-card{display:flex;gap:32px;align-items:flex-start}.pav-section{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:120px}.pav{width:90px;height:90px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;color:white;font-family:'Syne',sans-serif}.pav-name{font-size:15px;font-weight:700;text-align:center}.pav-email{font-size:12px;color:var(--text2);text-align:center}.pform{flex:1;display:flex;flex-direction:column;gap:16px}.fg{display:flex;flex-direction:column;gap:6px}label{font-size:13px;color:var(--text2);font-weight:500}.ta{min-height:80px;resize:vertical}.skills-wrap{display:grid;grid-template-columns:1fr 1fr;gap:14px}.skills-col{background:var(--bg3);border:1px solid var(--border2);border-radius:12px;padding:12px}.tags{display:flex;flex-wrap:wrap;gap:6px;min-height:30px;margin:8px 0}.tag{background:var(--blue-glow);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:12px}.tag.learn{background:rgba(16,185,129,0.12)}.empty-sm{color:var(--text3);font-size:12px}.add-row{display:flex;gap:8px}.add-row .input{flex:1}.success-box{background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 14px;color:#34d399;font-size:13px}.error-box{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 14px;color:#f87171;font-size:13px}.pactions{display:flex;gap:12px}button.btn-primary{padding:10px 18px}`]
})
export class ProfileComponent implements OnInit {
  user:any; form={name:'',bio:''}; saving=false; saved=false; error='';
  teachSkills:any[]=[]; learnSkills:any[]=[];
  newTeachSkill=''; newLearnSkill=''; addingSkill=false;
  colors=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n:string=''){return this.colors[(n?.charCodeAt(0)||0)%this.colors.length];}
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    this.user=this.auth.currentUser;
    if(this.user){
      this.form.name=this.user.name||'';
      this.form.bio=this.user.bio||'';
      this.loadSkills();
    }
  }

  loadSkills(){
    if(!this.user?.userId) return;
    this.api.getUserSkills(this.user.userId).subscribe({
      next:(d:any[])=>{
        const list=d||[];
        this.teachSkills=list.filter((s:any)=>s?.isTeach===true||s?.isTeach===1||s?.isTeach==='1'||s?.isTeach==='true');
        this.learnSkills=list.filter((s:any)=>s?.isLearn===true||s?.isLearn===1||s?.isLearn==='1'||s?.isLearn==='true');
      },
      error:()=>{}
    });
  }

  addSkill(isTeach:boolean){
    if(!this.user?.userId) return;
    const name=(isTeach?this.newTeachSkill:this.newLearnSkill).trim();
    if(!name) return;
    this.error='';
    this.addingSkill=true;
    this.api.searchSkills(name).subscribe({
      next:(skills:any[])=>{
        const found=(skills||[]).find((s:any)=>(s?.name||'').toLowerCase()===name.toLowerCase()) || (skills||[])[0];
        if(!found?.skillId){
          this.error='Skill not found. Please use an existing skill name.';
          this.addingSkill=false;
          return;
        }
        this.api.addUserSkill({userId:this.user.userId,skill:{skillId:found.skillId},isTeach:isTeach,isLearn:!isTeach}).subscribe({
          next:()=>{
            if(isTeach) this.newTeachSkill=''; else this.newLearnSkill='';
            this.addingSkill=false;
            this.loadSkills();
          },
          error:()=>{this.error='Failed to add skill.';this.addingSkill=false;}
        });
      },
      error:()=>{this.error='Skill search failed.';this.addingSkill=false;}
    });
  }

  save(){
    if(!this.user?.userId){this.error='Please sign in again.';return;}
    this.saving=true;this.error='';
    this.api.updateUser(this.user?.userId,{name:this.form.name,bio:this.form.bio,email:this.user?.email}).subscribe({
      next:u=>{this.auth.setUser(u);this.saving=false;this.saved=true;setTimeout(()=>this.saved=false,3000);},
      error:e=>{this.error=e?.error?.message||'Failed to save.';this.saving=false;}
    });
  }
}
