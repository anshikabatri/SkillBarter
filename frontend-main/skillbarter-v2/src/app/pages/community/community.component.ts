import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent implements OnInit {
  stories:any[]=[]; topUsers:any[]=[]; loading=true; showForm=false; posting=false;
  newStory={title:'',content:''};
  error='';
  colors=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n:string=''){return this.colors[(n?.charCodeAt(0)||0)%this.colors.length];}
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    this.api.getAllStories().subscribe({next:d=>{this.stories=d||[];this.loading=false;},error:()=>this.loading=false});
    this.api.getAllUsers().subscribe({next:d=>{this.topUsers=(d||[]).sort((a:any,b:any)=>((b.xp||b.xpPoints||b.skillPoints||0)-(a.xp||a.xpPoints||a.skillPoints||0))).slice(0,6);},error:()=>{}});
  }
  submitStory(){
    const u=this.auth.currentUser;
    const title=(this.newStory.title||'').trim();
    const content=(this.newStory.content||'').trim();
    if(!u){this.error='Please login to post a story.';return;}
    if(!title||!content){this.error='Please enter both title and story.';return;}
    if(title.length<5||title.length>120){this.error='Title must be between 5 and 120 characters.';return;}
    if(content.length<20||content.length>2000){this.error='Story must be between 20 and 2000 characters.';return;}
    this.error='';
    this.posting=true;
    this.api.createStory({user:{userId:u.userId},title,content}).subscribe({
      next:s=>{this.stories=[s,...this.stories];this.newStory={title:'',content:''};this.showForm=false;this.posting=false;},
      error:()=>this.posting=false
    });
  }

  resetForm(){
    this.newStory={title:'',content:''};
    this.error='';
  }

  cancelForm(){
    this.resetForm();
    this.showForm=false;
  }
}
