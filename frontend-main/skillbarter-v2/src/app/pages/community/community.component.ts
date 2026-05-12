import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

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
  editStory={title:'',content:''};
  editingStoryId:number|null=null;
  savingStoryId:number|null=null;
  error='';
  currentUserId:number|null=null;
  colors=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  gc(n:string=''){return this.colors[(n?.charCodeAt(0)||0)%this.colors.length];}
  constructor(private auth:AuthService,private api:ApiService){}
  ngOnInit(){
    const u=this.auth.currentUser;
    if(u?.userId){
      this.currentUserId=u.userId;
    } else if(this.auth.isLoggedIn){
      this.auth.resolveAndStoreCurrentUser().subscribe({
        next:user=>{ this.currentUserId=user.userId; },
        error:()=>{}
      });
    }
    this.loadStories();
    this.api.getAllUsers().subscribe({next:d=>{this.topUsers=(d||[]).sort((a:any,b:any)=>((b.xp||b.xpPoints||b.skillPoints||0)-(a.xp||a.xpPoints||a.skillPoints||0))).slice(0,6);},error:()=>{}});
  }

  loadStories(){
    this.loading=true;
    this.api.getAllStories().subscribe({next:d=>{this.stories=d||[];this.loading=false;},error:()=>this.loading=false});
  }

  canManageStory(story:any){
    return Number(story?.user?.userId) === Number(this.currentUserId);
  }

  submitStory(){
    const u=this.auth.currentUser || (this.currentUserId ? { userId: this.currentUserId } : null);
    const title=(this.newStory.title||'').trim();
    const content=(this.newStory.content||'').trim();
    if(!u){this.error='Please login to post a story.';return;}
    if(!title||!content){this.error='Please enter both title and story.';return;}
    if(title.length<5||title.length>120){this.error='Title must be between 5 and 120 characters.';return;}
    if(content.length<20||content.length>2000){this.error='Story must be between 20 and 2000 characters.';return;}
    this.error='';
    this.posting=true;
    this.api.createStory({user:{userId:u.userId},title,content}).pipe(finalize(()=>this.posting=false)).subscribe({
      next:s=>{this.stories=[s,...this.stories];this.newStory={title:'',content:''};this.showForm=false;},
      error:()=>{}
    });
  }

  startEditStory(story:any){
    if(!this.canManageStory(story)) return;
    this.editingStoryId=story.storyId;
    this.editStory={title:story.title||'',content:story.content||''};
    this.error='';
  }

  cancelEditStory(){
    this.editingStoryId=null;
    this.editStory={title:'',content:''};
    this.error='';
  }

  updateStory(story:any){
    if(!this.canManageStory(story)) return;
    const title=(this.editStory.title||'').trim();
    const content=(this.editStory.content||'').trim();
    if(!title||!content){this.error='Please enter both title and story.';return;}
    if(title.length<5||title.length>120){this.error='Title must be between 5 and 120 characters.';return;}
    if(content.length<20||content.length>2000){this.error='Story must be between 20 and 2000 characters.';return;}
    this.error='';
    this.savingStoryId=story.storyId;
    this.api.updateStory(story.storyId,{user:{userId:story.user?.userId},title,content}).pipe(finalize(()=>this.savingStoryId=null)).subscribe({
      next:(updated:any)=>{
        this.stories=this.stories.map(s=>Number(s.storyId)===Number(story.storyId)?updated:s);
        this.cancelEditStory();
      },
      error:(e:any)=>{ this.error=e?.error?.message || 'Failed to update story.'; }
    });
  }

  deleteStory(story:any){
    if(!this.canManageStory(story)) return;
    if(!confirm('Delete this story?')) return;
    this.error='';
    this.api.deleteStory(story.storyId).subscribe({
      next:()=>{
        this.stories=this.stories.filter(s=>Number(s.storyId)!==Number(story.storyId));
        if(Number(this.editingStoryId)===Number(story.storyId)) this.cancelEditStory();
      },
      error:(e:any)=>{ this.error=e?.error?.message || 'Failed to delete story.'; }
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
