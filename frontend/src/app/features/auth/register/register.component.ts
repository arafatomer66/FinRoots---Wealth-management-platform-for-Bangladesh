import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-page">
      <div class="brand-panel">
        <div class="brand-content">
          <div class="logo-icon">
            <mat-icon>account_balance</mat-icon>
          </div>
          <h1 class="brand-name">FinRoots</h1>
          <p class="brand-tagline">Start your wealth journey today</p>

          <div class="stats">
            <div class="stat">
              <span class="stat-value">11</span>
              <span class="stat-label">Asset Types</span>
            </div>
            <div class="stat">
              <span class="stat-value">3</span>
              <span class="stat-label">Succession Laws</span>
            </div>
            <div class="stat">
              <span class="stat-value">100%</span>
              <span class="stat-label">BD Compliant</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Create your account</h2>
            <p>Get started with FinRoots in seconds</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field-group">
              <label>Full Name</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="name" placeholder="Enter your full name" />
                <mat-icon matPrefix>person_outline</mat-icon>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="email" type="email" placeholder="you@example.com" />
                <mat-icon matPrefix>mail_outline</mat-icon>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Phone (optional)</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="phone" placeholder="01XXXXXXXXX" />
                <mat-icon matPrefix>phone_outlined</mat-icon>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Password</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="password" [type]="showPassword ? 'text' : 'password'" placeholder="Min. 8 characters" />
                <mat-icon matPrefix>lock_outline</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
            </div>

            @if (error) {
              <div class="error-msg">
                <mat-icon>error_outline</mat-icon>
                <span>{{ error }}</span>
              </div>
            }

            <button mat-raised-button color="primary" class="submit-btn" type="submit" [disabled]="loading || form.invalid">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="divider"><span>or</span></div>

          <p class="switch-link">
            Already have an account? <a routerLink="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }

    .brand-panel {
      flex: 1;
      background: linear-gradient(160deg, #0a0f1e 0%, #111d3a 40%, #0f1a33 100%);
      display: flex; flex-direction: column; justify-content: center;
      padding: 60px; position: relative; overflow: hidden;
    }
    .brand-panel::before {
      content: ''; position: absolute; top: -200px; right: -200px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%);
    }

    .brand-content { position: relative; z-index: 1; }

    .logo-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold));
      border-radius: 14px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(212,168,83,0.25); margin-bottom: 24px;
      mat-icon { color: #0a0f1e; font-size: 28px; width: 28px; height: 28px; }
    }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px; font-weight: 700; color: #fff; margin-bottom: 8px;
    }
    .brand-tagline { font-size: 16px; color: var(--text-secondary); margin-bottom: 48px; font-weight: 300; }

    .stats { display: flex; gap: 32px; }
    .stat { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; color: var(--accent-gold); }
    .stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

    .form-panel {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: var(--bg-secondary); padding: 40px;
    }
    .form-wrapper { width: 100%; max-width: 420px; }
    .form-header {
      margin-bottom: 32px;
      h2 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
      p { color: var(--text-secondary); font-size: 14px; }
    }
    .field-group {
      margin-bottom: 4px;
      label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
    }
    .full-width { width: 100%; }
    mat-icon[matPrefix] { color: var(--text-muted) !important; margin-right: 8px; }

    .error-msg {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; background: rgba(251,113,133,0.1);
      border: 1px solid rgba(251,113,133,0.2); border-radius: 8px;
      color: var(--accent-rose); font-size: 13px; margin-bottom: 16px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .submit-btn { width: 100%; height: 48px; font-size: 15px !important; margin-top: 8px; }

    .divider {
      display: flex; align-items: center; margin: 28px 0;
      &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
      span { padding: 0 16px; color: var(--text-muted); font-size: 13px; }
    }
    .switch-link {
      text-align: center; color: var(--text-secondary); font-size: 14px;
      a { color: var(--accent-gold); font-weight: 600; }
    }

    @media (max-width: 900px) {
      .auth-page { flex-direction: column; }
      .brand-panel { padding: 40px; min-height: auto; }
      .stats { display: none; }
    }
  `],
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error || 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
