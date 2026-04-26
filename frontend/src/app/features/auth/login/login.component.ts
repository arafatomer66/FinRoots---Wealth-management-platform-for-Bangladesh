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
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-page">
      <!-- Left branding panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="logo-mark">
            <div class="logo-icon">
              <mat-icon>account_balance</mat-icon>
            </div>
          </div>
          <h1 class="brand-name">FinRoots</h1>
          <p class="brand-tagline">Wealth Management for Bangladesh</p>

          <div class="features">
            <div class="feature-item">
              <mat-icon>trending_up</mat-icon>
              <div>
                <strong>Track Net Worth</strong>
                <span>Monitor assets, liabilities & cashflow</span>
              </div>
            </div>
            <div class="feature-item">
              <mat-icon>calculate</mat-icon>
              <div>
                <strong>Tax & Zakat</strong>
                <span>Bangladesh tax slabs & Islamic finance</span>
              </div>
            </div>
            <div class="feature-item">
              <mat-icon>family_restroom</mat-icon>
              <div>
                <strong>Inheritance Planning</strong>
                <span>Muslim, Hindu & Christian succession laws</span>
              </div>
            </div>
          </div>
        </div>
        <div class="brand-footer">
          <p>Trusted by families across Bangladesh</p>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your FinRoots account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field-group">
              <label>Email address</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="email" type="email" placeholder="you@example.com" />
                <mat-icon matPrefix>mail_outline</mat-icon>
              </mat-form-field>
            </div>

            <div class="field-group">
              <label>Password</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="password" [type]="showPassword ? 'text' : 'password'" placeholder="Enter your password" />
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
                Sign In
              }
            </button>
          </form>

          <div class="divider">
            <span>or</span>
          </div>

          <p class="switch-link">
            Don't have an account? <a routerLink="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }

    /* ── Brand Panel ── */
    .brand-panel {
      flex: 1;
      background: linear-gradient(160deg, #0a0f1e 0%, #111d3a 40%, #0f1a33 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }

    .brand-panel::before {
      content: '';
      position: absolute;
      top: -200px;
      right: -200px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(212, 168, 83, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .brand-panel::after {
      content: '';
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(79, 141, 247, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .brand-content { position: relative; z-index: 1; }

    .logo-mark {
      margin-bottom: 24px;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(212, 168, 83, 0.25);
      mat-icon {
        color: #0a0f1e;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }

    .brand-tagline {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 48px;
      font-weight: 300;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      mat-icon {
        color: var(--accent-gold);
        font-size: 22px;
        width: 22px;
        height: 22px;
        margin-top: 2px;
        flex-shrink: 0;
      }
      div {
        display: flex;
        flex-direction: column;
      }
      strong {
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 2px;
      }
      span {
        color: var(--text-muted);
        font-size: 13px;
      }
    }

    .brand-footer {
      position: absolute;
      bottom: 40px;
      left: 60px;
      z-index: 1;
      p {
        color: var(--text-muted);
        font-size: 13px;
      }
    }

    /* ── Form Panel ── */
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      padding: 40px;
    }

    .form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .form-header {
      margin-bottom: 36px;
      h2 {
        font-size: 26px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 8px;
      }
      p {
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .field-group {
      margin-bottom: 4px;
      label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
        margin-bottom: 6px;
      }
    }

    .full-width { width: 100%; }

    mat-icon[matPrefix] {
      color: var(--text-muted) !important;
      margin-right: 8px;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(251, 113, 133, 0.1);
      border: 1px solid rgba(251, 113, 133, 0.2);
      border-radius: var(--radius-sm);
      color: var(--accent-rose);
      font-size: 13px;
      margin-bottom: 16px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 15px !important;
      margin-top: 8px;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 28px 0;
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-subtle);
      }
      span {
        padding: 0 16px;
        color: var(--text-muted);
        font-size: 13px;
      }
    }

    .switch-link {
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      a {
        color: var(--accent-gold);
        font-weight: 600;
      }
    }

    @media (max-width: 900px) {
      .auth-page { flex-direction: column; }
      .brand-panel { padding: 40px; min-height: auto; }
      .features { display: none; }
      .brand-footer { display: none; }
    }
  `],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        this.loading = false;
      },
    });
  }
}
