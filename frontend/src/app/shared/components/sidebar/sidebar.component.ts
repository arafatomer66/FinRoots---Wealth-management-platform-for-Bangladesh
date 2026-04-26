import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <div class="sidebar">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-icon">
          <mat-icon>account_balance</mat-icon>
        </div>
        <div class="logo-text">
          <h2>FinRoots</h2>
          <span class="tagline">Wealth Management</span>
        </div>
      </div>

      <!-- User card -->
      <div class="user-card">
        <div class="user-avatar">{{ getInitials() }}</div>
        <div class="user-info">
          <span class="user-name">{{ authService.user()?.name }}</span>
          <span class="user-email">{{ authService.user()?.email }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-section">
        <span class="nav-label">Overview</span>
        <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>grid_view</mat-icon>
          <span>Dashboard</span>
        </a>

        <span class="nav-label">Finances</span>
        <a class="nav-item" routerLink="/assets" routerLinkActive="active">
          <mat-icon>account_balance_wallet</mat-icon>
          <span>Assets</span>
        </a>
        <a class="nav-item" routerLink="/liabilities" routerLinkActive="active">
          <mat-icon>credit_card</mat-icon>
          <span>Liabilities</span>
        </a>
        <a class="nav-item" routerLink="/income" routerLinkActive="active">
          <mat-icon>trending_up</mat-icon>
          <span>Income</span>
        </a>
        <a class="nav-item" routerLink="/expenses" routerLinkActive="active">
          <mat-icon>receipt</mat-icon>
          <span>Expenses</span>
        </a>
        <a class="nav-item" routerLink="/budgets" routerLinkActive="active">
          <mat-icon>pie_chart</mat-icon>
          <span>Budgets</span>
        </a>
        <a class="nav-item" routerLink="/investments" routerLinkActive="active">
          <mat-icon>trending_up</mat-icon>
          <span>Investments</span>
        </a>
        <a class="nav-item" routerLink="/insurance" routerLinkActive="active">
          <mat-icon>shield</mat-icon>
          <span>Insurance</span>
        </a>
        <a class="nav-item" routerLink="/goals" routerLinkActive="active">
          <mat-icon>flag</mat-icon>
          <span>Goals</span>
        </a>

        <span class="nav-label">Planning</span>
        <a class="nav-item" routerLink="/family" routerLinkActive="active">
          <mat-icon>people_outline</mat-icon>
          <span>Family</span>
        </a>
        <a class="nav-item" routerLink="/inheritance" routerLinkActive="active">
          <mat-icon>account_tree</mat-icon>
          <span>Inheritance</span>
        </a>
        <a class="nav-item" routerLink="/documents" routerLinkActive="active">
          <mat-icon>folder</mat-icon>
          <span>Documents</span>
        </a>

        <span class="nav-label">Calculators</span>
        <a class="nav-item" routerLink="/tax" routerLinkActive="active">
          <mat-icon>receipt_long</mat-icon>
          <span>Tax Calculator</span>
        </a>
        <a class="nav-item" routerLink="/zakat" routerLinkActive="active">
          <mat-icon>volunteer_activism</mat-icon>
          <span>Zakat</span>
        </a>
        <a class="nav-item" routerLink="/charity" routerLinkActive="active">
          <mat-icon>favorite</mat-icon>
          <span>Sadaqah</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <a class="nav-item" routerLink="/profile" routerLinkActive="active">
          <mat-icon>settings</mat-icon>
          <span>Settings</span>
        </a>
        <a class="nav-item logout" (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      overflow-y: auto;
    }

    /* ── Logo ── */
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px 20px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(212, 168, 83, 0.2);
      mat-icon { color: #0a0f1e; font-size: 22px; width: 22px; height: 22px; }
    }

    .logo-text {
      h2 {
        font-family: 'Playfair Display', serif;
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.2;
      }
    }

    .tagline {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 400;
      letter-spacing: 0.02em;
    }

    /* ── User Card ── */
    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 4px 16px 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Navigation ── */
    .nav-section {
      flex: 1;
      padding: 0 12px;
      overflow-y: auto;
    }

    .nav-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 16px 12px 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--text-muted);
        transition: color var(--transition-fast);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        text-decoration: none;
        mat-icon { color: var(--text-secondary); }
      }

      &.active {
        background: rgba(212, 168, 83, 0.1);
        color: var(--accent-gold);
        mat-icon { color: var(--accent-gold); }
      }
    }

    /* ── Footer ── */
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border-subtle);
      margin-top: auto;
    }

    .logout {
      &:hover {
        background: rgba(251, 113, 133, 0.08) !important;
        color: var(--accent-rose) !important;
        mat-icon { color: var(--accent-rose) !important; }
      }
    }
  `],
})
export class SidebarComponent {
  constructor(public authService: AuthService) {}

  getInitials(): string {
    const name = this.authService.user()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout() {
    this.authService.logout();
  }
}
