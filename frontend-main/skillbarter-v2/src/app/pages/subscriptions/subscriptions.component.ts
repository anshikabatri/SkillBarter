import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
styles:[`.subs-page{max-width:800px}h1{font-size:28px;font-weight:800;margin-bottom:6px;font-family:'Syne',sans-serif}.sub{color:var(--text2);font-size:14px;margin-bottom:32px}.plans{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:28px}.plan.featured{background:var(--bg3);border-color:var(--blue)}.plan h2{font-size:20px;font-weight:700;margin-bottom:8px;font-family:'Syne',sans-serif}.price{font-size:36px;font-weight:900;font-family:'Syne',sans-serif;margin-bottom:20px}.price span{font-size:16px;color:var(--text2);font-family:'DM Sans',sans-serif}ul{list-style:none;margin-bottom:24px;display:flex;flex-direction:column;gap:8px}li{font-size:14px;color:var(--text2)}li::before{content:'✓  ';color:var(--blue)}.btn-soon{width:100%;padding:12px;background:var(--bg3);color:var(--text3);border:1px solid var(--border2);border-radius:10px;font-size:14px;cursor:not-allowed}`]
})
export class SubscriptionsComponent {
  plans=[
    {name:'Pro',price:'899',featured:false,features:['+150 SP every month','Chat without matching','Early access to new features','Session summary generator']},
    {name:'Elite',price:'1799',featured:true,features:['+400 SP every month','Everything in Pro','XP earning boost','Session transcript','Verified badge']}
  ];
}
