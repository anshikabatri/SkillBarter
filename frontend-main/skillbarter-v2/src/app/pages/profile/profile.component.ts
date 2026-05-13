import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any;
  form = { name: '', bio: '' };
  private initialForm = { name: '', bio: '' };
  saving = false;
  saved = false;
  error = '';
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  uploadingPhoto = false;
  showPhotoPicker = true;
  photoSavedMessage = '';
  photoUpdatedAt = '';
  teachSkills: any[] = [];
  learnSkills: any[] = [];
  addingSkill = false;
  allSkills: any[] = [];
  selectedTeachSkillId: number | null = null;
  selectedLearnSkillId: number | null = null;
  colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  private readonly nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;
  private readonly maxPhotoSizeBytes = 5 * 1024 * 1024;
  private readonly allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  gc(n: string = '') { return this.colors[(n?.charCodeAt(0) || 0) % this.colors.length]; }

  private isSkillFlagEnabled(value: any): boolean {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  private skillIdOf(item: any): number | null {
    const value = item?.skill?.skillId ?? item?.skillId ?? null;
    return value === null || value === undefined ? null : Number(value);
  }

  private normalizeSkills(list: any[]): any[] {
    const merged = new Map<number, any>();
    (list || []).forEach((item: any) => {
      const skillId = this.skillIdOf(item);
      if (skillId === null || Number.isNaN(skillId)) return;
      const existing = merged.get(skillId);
      if (existing) {
        existing.isTeach = this.isSkillFlagEnabled(existing.isTeach) || this.isSkillFlagEnabled(item?.isTeach);
        existing.isLearn = this.isSkillFlagEnabled(existing.isLearn) || this.isSkillFlagEnabled(item?.isLearn);
        return;
      }
      merged.set(skillId, { ...item });
    });
    return Array.from(merged.values());
  }

  hasSkill(skillId: number | null): boolean {
    if (skillId === null || skillId === undefined) return false;
    return [...this.teachSkills, ...this.learnSkills].some((skill: any) => Number(this.skillIdOf(skill)) === Number(skillId));
  }

  availableSkills(): any[] {
    return this.allSkills.filter((skill: any) => !this.hasSkill(skill?.skillId));
  }

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.user = this.auth.currentUser;
    if (this.user) {
      this.form.name = this.user.name || '';
      this.form.bio = this.user.bio || '';
      this.initialForm = { ...this.form };
      this.showPhotoPicker = !this.user?.profilePhotoUrl;
      this.loadSkills();
      this.api.getAllSkills().subscribe({
        next: (skills: any[]) => { this.allSkills = skills || []; },
        error: () => {}
      });
    }
  }

  loadSkills() {
    if (!this.user?.userId) return;
    this.api.getUserSkills(this.user.userId).subscribe({
      next: (d: any[]) => {
        const list = this.normalizeSkills(d || []);
        this.teachSkills = list.filter((s: any) => s?.isTeach === true || s?.isTeach === 1 || s?.isTeach === '1' || s?.isTeach === 'true');
        this.learnSkills = list.filter((s: any) => s?.isLearn === true || s?.isLearn === 1 || s?.isLearn === '1' || s?.isLearn === 'true');
      },
      error: () => {}
    });
  }

  addSkillById(isTeach: boolean) {
    if (!this.user?.userId) return;
    const skillId = isTeach ? this.selectedTeachSkillId : this.selectedLearnSkillId;
    if (!skillId) return;
    if (this.hasSkill(skillId)) {
      this.error = 'That skill is already added to your profile.';
      return;
    }
    this.error = '';
    this.addingSkill = true;
    this.api.addUserSkill({
      userId: this.user.userId,
      skill: { skillId },
      isTeach: isTeach,
      isLearn: !isTeach
    }).subscribe({
      next: () => {
        if (isTeach) this.selectedTeachSkillId = null;
        else this.selectedLearnSkillId = null;
        this.addingSkill = false;
        this.loadSkills();
      },
      error: () => { this.error = 'Failed to add skill.'; this.addingSkill = false; }
    });
  }

  removeSkill(userSkill: any) {
    if (!confirm('Remove this skill?')) return;
    this.api.deleteUserSkill(userSkill.userSkillId).subscribe({
      next: () => { this.loadSkills(); },
      error: () => { this.error = 'Failed to remove skill.'; }
    });
  }

  save() {
    if (!this.user?.userId) { this.error = 'Please sign in again.'; return; }
    const name = String(this.form.name || '').trim();
    const bio = String(this.form.bio || '').trim();
    if (!name) { this.error = 'Please enter your name.'; return; }
    if (!this.nameRegex.test(name)) { this.error = 'Please enter a valid name.'; return; }
    if (bio.length > 500) { this.error = 'Profile description must be 500 characters or less.'; return; }

    this.form.name = name;
    this.form.bio = bio;
    this.saving = true; this.error = '';
    this.api.updateUser(this.user?.userId, { name, bio, email: this.user?.email }).subscribe({
      next: (u: any) => {
        this.auth.setUser(u);
        this.user = u;
        this.initialForm = { name: u?.name || name, bio: u?.bio || bio };
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: (e: any) => { this.error = e?.error?.message || 'Failed to save.'; this.saving = false; }
    });
  }

  resetForm() {
    this.form = { ...this.initialForm };
    this.error = '';
    this.saved = false;
  }

  cancelForm() {
    this.resetForm();
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    if (!this.allowedPhotoTypes.includes(file.type)) {
      this.error = 'Please upload a valid image file (JPG, PNG, WEBP, GIF).';
      input.value = '';
      return;
    }
    if (file.size > this.maxPhotoSizeBytes) {
      this.error = 'Photo size must be 5MB or less.';
      input.value = '';
      return;
    }
    this.error = '';
    this.photoSavedMessage = '';
    this.selectedPhoto = file;
    this.photoPreview = URL.createObjectURL(file);
  }

  uploadPhoto() {
    if (!this.user?.userId || !this.selectedPhoto) return;
    this.uploadingPhoto = true;
    this.error = '';
    this.api.uploadProfilePhoto(this.user.userId, this.selectedPhoto).subscribe({
      next: (u: any) => {
        this.auth.setUser(u);
        this.user = u;
        this.showPhotoPicker = false;
        this.photoSavedMessage = 'Profile photo updated successfully.';
        this.photoUpdatedAt = new Date().toLocaleString();
        this.selectedPhoto = null;
        this.photoPreview = null;
        this.uploadingPhoto = false;
      },
      error: (e: any) => {
        this.error = e?.error?.message || 'Failed to upload photo.';
        this.uploadingPhoto = false;
      }
    });
  }
}