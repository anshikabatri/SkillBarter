import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-community', standalone: true, imports: [CommonModule, FormsModule],
template:`
<div class="comm-page">
  <div class="comm-header"><h1>Community</h1><button class="btn-primary" (click)="showForm=!showForm">{{ showForm?'Cancel':'Share Your Story' }}</button></div>
  <div class="story-form card" *ngIf="showForm">
    <h3>Share Your Story</h3>
    <input [(ngModel)]="newStory.title" class="input" placeholder="Title (e.g. Swapped Python for Guitar lessons)">
    <textarea [(ngModel)]="newStory.content" class="input ta" placeholder="Tell your story..." rows="4"></textarea>
    <button class="btn-primary" (click)="submitStory()" [disabled]="posting">{{ posting?'Posting...':'Post Story' }}</button>
  </div>
  <div class="loading" *ngIf="loading">Loading stories...</div>
  <div class="stories-grid" *ngIf="stories.length>0">
    <div class="story-card card" *ngFor="let s of stories">
      <div class="smeta"><span class="sauthor">{{ s.user?.name || 'User' }}</span><span class="stime">{{ s.createdAt | date:'MMM d' }}</span></div>
      <h3>{{ s.title }}</h3>
      <p>{{ s.content }}</p>
    </div>
  </div>
  <div class="empty" *ngIf="!loading&&stories.length===0">No stories yet. Be the first to share!</div>
  <div class="section-title">Top Contributors</div>
  <div class="contrib-grid">
    <div class="contrib-card card" *ngFor="let u of topUsers;let i=index">
      <div class="rank">#{{ i+1 }}</div>
      <div class="cav" [style.background]="gc(u.name)">{{ u.name?.charAt(0) }}</div>
      <div class="cinfo"><div class="cname">{{ u.name }}</div><div class="cxp">{{ u.xpPoints||u.skillPoints||0 }} XP</div></div>
    </div>
  </div>
</div>`,
styles:[`.comm-page{max-width:1000px}.comm-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.comm-header h1{font-size:26px;font-weight:800}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:20px}.story-form{margin-bottom:24px;display:flex;flex-direction:column;gap:12px}.story-form h3{font-size:16px;font-weight:700;margin-bottom:4px}.ta{min-height:80px;resize:vertical}.loading{color:var(--text2);font-size:14px;padding:20px 0}.stories-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:32px}.story-card{}.smeta{display:flex;justify-content:space-between;margin-bottom:8px}.sauthor{font-size:13px;font-weight:600;color:var(--blue)}.stime{font-size:12px;color:var(--text3)}.story-card h3{font-size:15px;font-weight:700;margin-bottom:8px;line-height:1.4}.story-card p{color:var(--text2);font-size:13px;line-height:1.6}.empty{color:var(--text2);font-size:14px;text-align:center;padding:40px 0}.section-title{font-size:20px;font-weight:800;margin:28px 0 16px;font-family:'Syne',sans-serif}.contrib-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.contrib-card{display:flex;align-items:center;gap:12px}.rank{font-size:16px;font-weight:800;color:var(--text2);min-width:28px;font-family:'Syne',sans-serif}.cav{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white;font-family:'Syne',sans-serif}.cname{font-size:14px;font-weight:700}.cxp{font-size:12px;color:var(--blue);font-weight:600}`]
})
export class CommunityComponent implements OnInit {
  stories:any[]=[]; topUsers:any[]=[]; loading=true; showForm=false; posting=false;
  newStory={title:'',content:''};
  colors=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n:string=''){return this.colors[(n?.charCodeAt(0)||0)%this.colors.length];}
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    this.api.getAllStories().subscribe({next:d=>{this.stories=d||[];this.loading=false;},error:()=>this.loading=false});
    this.api.getAllUsers().subscribe({next:d=>{this.topUsers=(d||[]).sort((a:any,b:any)=>((b.xpPoints||b.skillPoints||0)-(a.xpPoints||a.skillPoints||0))).slice(0,6);},error:()=>{}});
  }
  submitStory(){
    const u=this.auth.currentUser;
    if(!this.newStory.title||!this.newStory.content||!u)return;
    this.posting=true;
    this.api.createStory({user:{userId:u.userId},title:this.newStory.title,content:this.newStory.content}).subscribe({
      next:s=>{this.stories=[s,...this.stories];this.newStory={title:'',content:''};this.showForm=false;this.posting=false;},
      error:()=>this.posting=false
    });
  }
}
