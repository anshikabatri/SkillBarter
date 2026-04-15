import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-saved-profiles', standalone: true, imports: [CommonModule, RouterLink],
template:`
<div class="saved-page">
  <h1>Saved Profiles</h1>
  <p class="sub">People you matched with</p>
  <div class="loading" *ngIf="loading">Loading...</div>
  <div class="empty" *ngIf="!loading&&matches.length===0">No matches yet. <a routerLink="/app/matches">Find people to connect with!</a></div>
  <div class="grid" *ngIf="matches.length>0">
    <div class="mcard card" *ngFor="let m of matches">
      <div class="mhead">
        <div class="mav" [style.background]="gc(getOther(m)?.name)">{{ getOther(m)?.name?.charAt(0) }}</div>
        <div><h3>{{ getOther(m)?.name }}</h3><div class="mscore" *ngIf="m.matchScore">{{ m.matchScore | number:'1.0-0' }}% match</div></div>
      </div>
      <p class="mbio" *ngIf="getOther(m)?.bio">{{ getOther(m)?.bio }}</p>
      <div class="mactions">
        <a routerLink="/app/chat" class="btn-primary btn-sm">Message</a>
        <a routerLink="/app/matches" class="btn-ghost btn-sm">View Profile</a>
      </div>
    </div>
  </div>
</div>`,
styles:[`.saved-page{max-width:900px}h1{font-size:26px;font-weight:800;margin-bottom:6px}.sub{color:var(--text2);font-size:14px;margin-bottom:28px}.loading,.empty{color:var(--text2);font-size:14px;padding:20px 0}.empty a{color:var(--blue)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:20px}.mhead{display:flex;align-items:center;gap:12px;margin-bottom:10px}.mav{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:white;flex-shrink:0;font-family:'Syne',sans-serif}.mcard h3{font-size:16px;font-weight:700}.mscore{font-size:13px;color:var(--blue);font-weight:600}.mbio{font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.5}.mactions{display:flex;gap:8px}.btn-sm{padding:7px 16px;font-size:13px;border-radius:8px;text-decoration:none}`]
})
export class SavedProfilesComponent implements OnInit {
  matches:any[]=[]; loading=true;
  colors=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n:string=''){return this.colors[(n?.charCodeAt(0)||0)%this.colors.length];}
  me:any;
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){this.me=this.auth.currentUser;if(this.me?.userId)this.api.getMatchesByUser(this.me.userId).subscribe({next:d=>{this.matches=d||[];this.loading=false;},error:()=>this.loading=false});}
  getOther(m:any){return m.user1?.userId===this.me?.userId?m.user2:m.user1;}
}

@Component({ selector: 'app-subscriptions', standalone: true, imports: [CommonModule],
template:`
<div class="subs-page">
  <h1>SkillBarter+ Subscriptions</h1>
  <p class="sub">Unlock bonus SP, priority support, and premium features.</p>
  <div class="plans">
    <div class="plan card" *ngFor="let p of plans" [class.featured]="p.featured">
      <h2>{{ p.name }}</h2>
      <div class="price">₹{{ p.price }}<span>/mo</span></div>
      <ul><li *ngFor="let f of p.features">{{ f }}</li></ul>
      <button class="btn-soon" disabled>Coming Soon</button>
    </div>
  </div>
</div>`,
styles:[`.subs-page{max-width:800px}h1{font-size:28px;font-weight:800;margin-bottom:6px}.sub{color:var(--text2);font-size:14px;margin-bottom:32px}.plans{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:28px}.plan.featured{background:var(--bg3);border-color:var(--blue)}.plan h2{font-size:20px;font-weight:700;margin-bottom:8px}.price{font-size:36px;font-weight:900;font-family:'Syne',sans-serif;margin-bottom:20px}.price span{font-size:16px;color:var(--text2);font-family:'DM Sans',sans-serif}ul{list-style:none;margin-bottom:24px;display:flex;flex-direction:column;gap:8px}li{font-size:14px;color:var(--text2)}li::before{content:'✓ ';color:var(--blue)}.btn-soon{width:100%;padding:12px;background:var(--bg3);color:var(--text3);border:1px solid var(--border2);border-radius:10px;font-size:14px;cursor:not-allowed}`]
})
export class SubscriptionsComponent {
  plans=[
    {name:'Pro',price:'899',featured:false,features:['+150 SP every month','Chat without matching','Early access to new features','Session summary generator']},
    {name:'Elite',price:'1799',featured:true,features:['+400 SP every month','Everything in Pro','XP earning boost','Session transcript','Verified badge']}
  ];
}
