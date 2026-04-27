import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-saved-profiles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-profiles.component.html',
  styleUrl: './saved-profiles.component.css'
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

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './embedded-subscriptions.component.html',
  styleUrl: './embedded-subscriptions.component.css'
})
export class SubscriptionsComponent {
  plans=[
    {name:'Pro',price:'899',featured:false,features:['+150 SP every month','Chat without matching','Early access to new features','Session summary generator']},
    {name:'Elite',price:'1799',featured:true,features:['+400 SP every month','Everything in Pro','XP earning boost','Session transcript','Verified badge']}
  ];
}
