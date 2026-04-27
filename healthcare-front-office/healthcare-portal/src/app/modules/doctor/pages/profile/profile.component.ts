import { Component, OnInit, NgZone } from '@angular/core';
import { UserService, UserProfileDTO } from '../../../../services/user.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { DoctorAppointmentService } from '../../services/doctor-appointment.service';

@Component({
  selector: 'app-doctor-profile',
  template: `
    <div class="profile-wrapper">



      <!-- Loading Skeleton -->
      <ng-container *ngIf="isLoading">
        <div class="cover-banner skeleton-shimmer"></div>
        <div class="profile-container" style="margin-top: -5rem;">
          <div class="profile-grid">
            <div class="card card-center" style="padding-top: 4rem;">
              <div class="skeleton-shimmer" style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 1rem;"></div>
              <div class="skeleton-shimmer" style="width: 150px; height: 20px; border-radius: 6px; margin: 0 auto 0.5rem;"></div>
              <div class="skeleton-shimmer" style="width: 100px; height: 14px; border-radius: 6px; margin: 0 auto;"></div>
            </div>
            <div class="card card-right">
              <div class="skeleton-shimmer" style="width: 200px; height: 20px; border-radius: 6px; margin-bottom: 2rem;"></div>
              <div class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 12px; margin-bottom: 1rem;"></div>
              <div class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 12px; margin-bottom: 1rem;"></div>
              <div class="skeleton-shimmer" style="width: 100%; height: 48px; border-radius: 12px;"></div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Error State -->
      <div *ngIf="!isLoading && errorMessage" class="profile-container" style="padding-top: 3rem;">
        <div class="error-banner">
          <span style="font-size: 2.5rem;">⚠️</span>
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Profile Content -->
      <ng-container *ngIf="!isLoading && profile">

        <!-- Cover Banner -->
        <div class="cover-banner">
          <div class="cover-orb cover-orb-1"></div>
          <div class="cover-orb cover-orb-2"></div>
        </div>

        <div class="profile-container" style="margin-top: -5rem;">
          <div class="profile-grid">

            <!-- Left Card: Overview -->
            <div class="card card-center">
              <!-- Avatar -->
              <div class="avatar-area">
                <div class="avatar-ring">
                  <ng-container *ngIf="profile?.profilePicture; else defaultAvatar">
                    <img [src]="getAvatarUrl()" alt="Profile" class="avatar-img" />
                  </ng-container>
                  <ng-template #defaultAvatar>
                    <span class="avatar-emoji">👨‍⚕️</span>
                  </ng-template>
                  <div class="online-dot"></div>
                </div>
              </div>

              <h2 class="profile-name">{{ profile?.name }}</h2>

              <div class="role-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span>Doctor</span>
              </div>

              <div class="profile-email-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>{{ profile?.email }}</span>
              </div>

              <!-- Dynamic Stats -->
              <div class="stats-row">
                <div class="stat-item">
                  <p class="stat-num">{{ totalPatients }}</p>
                  <p class="stat-lbl">Patients</p>
                </div>
                <div class="stat-item">
                  <p class="stat-num">{{ totalAppointments }}</p>
                  <p class="stat-lbl">Appointments</p>
                </div>
              </div>

              <!-- Upload Picture -->
              <button type="button" class="upload-btn" (click)="triggerFileInput()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                Change Photo
              </button>
              <p *ngIf="uploadMsg" class="upload-msg" [class.success]="!uploadMsg.includes('Failed')">{{ uploadMsg }}</p>
            </div>

            <!-- Right Card: Edit Profile -->
            <div class="card card-right">

              <!-- Edit Name & Email -->
              <div class="section-block">
                <div class="section-header">
                  <div class="section-bar"></div>
                  <h3>Edit Profile</h3>
                </div>

                <div class="form-group">
                  <label>Full Name</label>
                  <div class="input-row">
                    <input type="text" [(ngModel)]="editName" placeholder="Enter your name" />
                    <button class="save-btn" (click)="saveName()" [disabled]="savingName || !editName.trim()">
                      {{ savingName ? 'Saving...' : 'Save' }}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <div class="input-row">
                    <input type="email" [(ngModel)]="editEmail" placeholder="Enter your email" />
                    <button class="save-btn" (click)="saveEmail()" [disabled]="savingEmail || !editEmail.trim()">
                      {{ savingEmail ? 'Saving...' : 'Save' }}
                    </button>
                  </div>
                </div>

                <p *ngIf="profileMsg" class="form-msg" [class.success]="profileMsg.includes('success') || profileMsg.includes('updated')">{{ profileMsg }}</p>
              </div>

              <!-- Change Password -->
              <div class="section-block" style="margin-top: 2rem;">
                <div class="section-header">
                  <div class="section-bar bar-amber"></div>
                  <h3>Change Password</h3>
                </div>

                <div class="form-group">
                  <label>Current Password</label>
                  <input type="password" [(ngModel)]="oldPassword" placeholder="Enter current password" />
                </div>

                <div class="form-group">
                  <label>New Password</label>
                  <input type="password" [(ngModel)]="newPassword" placeholder="Enter new password" />
                </div>

                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" [(ngModel)]="confirmPassword" placeholder="Confirm new password" />
                </div>

                <button class="change-pw-btn" (click)="changePassword()"
                  [disabled]="savingPw || !oldPassword || !newPassword || !confirmPassword">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {{ savingPw ? 'Changing...' : 'Update Password' }}
                </button>

                <p *ngIf="pwMsg" class="form-msg" [class.success]="pwMsg.includes('success')">{{ pwMsg }}</p>
              </div>

            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif; color: #0f172a; }

    .profile-wrapper { min-height: 100vh; background: #f8fafc; padding-bottom: 3rem; }

    /* Hidden file input */
    .hidden-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; padding: 0; margin: -1px; }

    /* Skeleton */
    @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
    .skeleton-shimmer { background: #e2e8f0; background-image: linear-gradient(90deg, #e2e8f0 0px, #f1f5f9 40px, #e2e8f0 80px); background-size: 600px 100%; animation: shimmer 1.8s infinite linear; }

    /* Cover — BLUE theme */
    .cover-banner { height: 10rem; width: 100%; background: linear-gradient(135deg, #2563eb, #3b82f6, #1d4ed8); position: relative; overflow: hidden; }
    .cover-orb { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.08); }
    .cover-orb-1 { width: 16rem; height: 16rem; top: -5rem; right: -3rem; }
    .cover-orb-2 { width: 8rem; height: 8rem; bottom: -2rem; left: 5rem; }

    /* Container */
    .profile-container { max-width: 1100px; margin-left: auto; margin-right: auto; padding: 0 1.5rem; position: relative; z-index: 10; }

    .profile-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    @media (min-width: 1024px) { .profile-grid { grid-template-columns: 340px 1fr; } }

    /* Cards */
    .card { background: white; border-radius: 1.25rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03); }
    .card-center { padding: 0 2rem 2rem; text-align: center; }
    .card-right { padding: 2rem; }

    /* Avatar */
    .avatar-area { display: flex; justify-content: center; margin-top: -4rem; margin-bottom: 1rem; }
    .avatar-ring { width: 8rem; height: 8rem; border-radius: 50%; border: 4px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.1); overflow: hidden; display: flex; align-items: center; justify-content: center; background: #eff6ff; position: relative; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-emoji { font-size: 3.5rem; }
    .online-dot { position: absolute; bottom: 6px; right: 6px; width: 14px; height: 14px; background: #22c55e; border-radius: 50%; border: 3px solid white; }

    .profile-name { font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }

    .role-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; background: #eff6ff; border-radius: 9999px; margin: 0.5rem auto 1rem; color: #2563eb; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

    .profile-email-row { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }

    /* Stats */
    .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1.25rem; margin-bottom: 1.25rem; }
    .stat-item { text-align: center; }
    .stat-num { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
    .stat-lbl { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem; }

    /* Upload button */
    .upload-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; color: #2563eb; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .upload-btn:hover { background: #dbeafe; border-color: #93c5fd; }
    .upload-msg { font-size: 0.8rem; color: #ef4444; margin-top: 0.5rem; font-weight: 600; }
    .upload-msg.success { color: #2563eb; }

    /* Sections */
    .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .section-bar { width: 4px; height: 1.5rem; background: #2563eb; border-radius: 4px; }
    .section-bar.bar-amber { background: #f59e0b; }
    .section-header h3 { font-size: 1.15rem; font-weight: 800; color: #0f172a; }

    /* Forms */
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; }
    .form-group input { width: 100%; padding: 0.7rem 1rem; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; color: #0f172a; background: #f8fafc; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    .form-group input:focus { border-color: #2563eb; background: white; }

    .input-row { display: flex; gap: 0.75rem; }
    .input-row input { flex: 1; }

    .save-btn { padding: 0.7rem 1.25rem; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border: none; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .save-btn:hover { box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transform: translateY(-1px); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

    .change-pw-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 12px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }
    .change-pw-btn:hover { box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); transform: translateY(-1px); }
    .change-pw-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

    .form-msg { font-size: 0.8rem; color: #ef4444; margin-top: 0.75rem; font-weight: 600; padding: 0.5rem 0.75rem; background: #fef2f2; border-radius: 8px; }
    .form-msg.success { color: #2563eb; background: #eff6ff; }

    /* Error */
    .error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 1rem; padding: 2rem; text-align: center; color: #dc2626; font-weight: 600; }

    @media (max-width: 768px) {
      .profile-container { padding: 0 1rem; }
      .input-row { flex-direction: column; }
    }
  `]
})
export class DoctorProfileComponent implements OnInit {

  profile: UserProfileDTO | null = null;
  isLoading = true;
  errorMessage = '';

  // Dynamic stats
  totalPatients = 0;
  totalAppointments = 0;

  // Edit profile
  editName = '';
  editEmail = '';
  savingName = false;
  savingEmail = false;
  profileMsg = '';

  // Change password
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPw = false;
  pwMsg = '';

  // Upload
  uploadMsg = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private appointmentService: DoctorAppointmentService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadStats();
  }

  triggerFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;
      const file = target.files[0];
      this.zone.run(() => {
        this.uploadMsg = '';
        this.userService.uploadProfilePicture(file).subscribe({
          next: (updated) => {
            this.profile = updated;
            this.uploadMsg = 'Photo updated successfully!';
          },
          error: () => {
            this.uploadMsg = 'Failed to upload photo.';
          }
        });
      });
    };
    input.click();
  }

  getAvatarUrl(): string {
    const pic = this.profile?.profilePicture;
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return 'http://localhost:8088/' + pic;
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.editName = data.name || '';
        this.editEmail = data.email || '';
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadStats() {
    const doctorId = this.authService.getUserId();
    if (!doctorId) return;

    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (appointments) => {
        const all = appointments || [];
        this.totalAppointments = all.length;
        const uniquePatients = new Set(all.map(a => a.patientName).filter(n => !!n));
        this.totalPatients = uniquePatients.size;
      },
      error: () => {}
    });
  }

  saveName() {
    if (!this.editName.trim()) return;
    this.savingName = true;
    this.profileMsg = '';
    this.userService.updateProfile({ name: this.editName.trim() }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.profileMsg = 'Name updated successfully!';
        this.savingName = false;
      },
      error: () => {
        this.profileMsg = 'Failed to update name.';
        this.savingName = false;
      }
    });
  }

  saveEmail() {
    if (!this.editEmail.trim()) return;
    this.savingEmail = true;
    this.profileMsg = '';
    this.userService.updateProfile({ email: this.editEmail.trim() }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.profileMsg = 'Email updated successfully! You may need to re-login.';
        this.savingEmail = false;
      },
      error: () => {
        this.profileMsg = 'Failed to update email.';
        this.savingEmail = false;
      }
    });
  }

  changePassword() {
    this.pwMsg = '';
    if (this.newPassword !== this.confirmPassword) {
      this.pwMsg = 'New passwords do not match.';
      return;
    }
    if (this.newPassword.length < 4) {
      this.pwMsg = 'Password must be at least 4 characters.';
      return;
    }
    this.savingPw = true;
    this.userService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.pwMsg = 'Password changed successfully!';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.savingPw = false;
      },
      error: (err) => {
        this.pwMsg = err?.error || 'Failed to change password. Check your current password.';
        this.savingPw = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadMsg = '';

    this.userService.uploadProfilePicture(file).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.uploadMsg = 'Photo updated successfully!';
      },
      error: () => {
        this.uploadMsg = 'Failed to upload photo.';
      }
    });
  }
}
