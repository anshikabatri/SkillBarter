import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent {
  plans=[
    {name:'Pro',price:'899',featured:false,features:['+150 SP every month','Chat without matching','Early access to new features','Session summary generator']},
    {name:'Elite',price:'1799',featured:true,features:['+400 SP every month','Everything in Pro','XP earning boost','Session transcript','Verified badge']}
  ];
}
