import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Profile Settings</h1>
          <p class="subtitle">Manage your personal information</p>
        </div>
      </div>

      <div class="form-card">
        <div class="form-section">
          <h3 class="section-title">Personal Information</h3>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" placeholder="01XXXXXXXXX" />
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Date of Birth</mat-label>
                <input matInput formControlName="date_of_birth" type="date" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="male">Male</mat-option>
                  <mat-option value="female">Female</mat-option>
                  <mat-option value="third_gender">Third Gender</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Religion</mat-label>
                <mat-select formControlName="religion">
                  <mat-option value="muslim">Muslim</mat-option>
                  <mat-option value="hindu">Hindu</mat-option>
                  <mat-option value="christian">Christian</mat-option>
                  <mat-option value="buddhist">Buddhist</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>NID Number</mat-label>
                <input matInput formControlName="nid_number" maxlength="17" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>TIN Number</mat-label>
              <input matInput formControlName="tin_number" maxlength="12" placeholder="12-digit TIN" />
            </mat-form-field>

            <div class="form-actions">
              <button type="submit" class="action-btn primary">
                <mat-icon>save</mat-icon> Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 700px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 32px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-subtle); }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private auth: AuthService, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      name: [''], phone: [''], date_of_birth: [''], gender: ['male'],
      religion: ['muslim'], nid_number: [''], tin_number: [''],
    });
  }

  ngOnInit() {
    this.api.getProfile().subscribe(user => this.form.patchValue(user));
  }

  save() {
    this.api.updateProfile(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Profile updated', 'OK', { duration: 3000 });
        this.auth.refreshUser().subscribe();
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed to update', 'OK', { duration: 3000 }),
    });
  }
}
