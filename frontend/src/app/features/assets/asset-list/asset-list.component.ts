import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, FormsModule, BdtPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Assets</h1>
          <p class="subtitle">Track and manage your portfolio</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by type</mat-label>
            <mat-select [(value)]="filterType" (selectionChange)="loadAssets()">
              <mat-option value="">All Types</mat-option>
              <mat-option value="sanchayapatra">Sanchayapatra</mat-option>
              <mat-option value="fdr">FDR</mat-option>
              <mat-option value="dps">DPS</mat-option>
              <mat-option value="stock">Stocks</mat-option>
              <mat-option value="mutual_fund">Mutual Funds</mat-option>
              <mat-option value="gold">Gold</mat-option>
              <mat-option value="real_estate">Real Estate</mat-option>
              <mat-option value="insurance">Insurance</mat-option>
              <mat-option value="bond">Bonds</mat-option>
              <mat-option value="cash_bank">Cash/Bank</mat-option>
            </mat-select>
          </mat-form-field>
          <a class="action-btn primary" routerLink="/assets/new">
            <mat-icon>add</mat-icon> Add Asset
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (error) {
        <div class="error-panel">
          <mat-icon>error_outline</mat-icon>
          <p>Failed to load assets</p>
          <button class="action-btn outline" (click)="loadAssets()">Retry</button>
        </div>
      } @else {
        <!-- Total card -->
        <div class="total-strip">
          <div class="total-item">
            <span class="total-label">Total Value</span>
            <span class="total-value">{{ totalValue | bdt }}</span>
          </div>
          <div class="total-item">
            <span class="total-label">Items</span>
            <span class="total-count">{{ totalItems }}</span>
          </div>
        </div>

        <div class="table-card">
          <table mat-table [dataSource]="assets">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let a">
                <span class="cell-name">{{ a.name }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="asset_type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let a">
                <span class="type-pill">{{ formatType(a.asset_type) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="institution">
              <th mat-header-cell *matHeaderCellDef>Institution</th>
              <td mat-cell *matCellDef="let a">{{ a.institution || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="current_value">
              <th mat-header-cell *matHeaderCellDef>Current Value</th>
              <td mat-cell *matCellDef="let a" class="value-cell">{{ a.current_value | bdt }}</td>
            </ng-container>

            <ng-container matColumnDef="maturity_date">
              <th mat-header-cell *matHeaderCellDef>Maturity</th>
              <td mat-cell *matCellDef="let a">{{ a.maturity_date ? (a.maturity_date | date:'MMM d, y') : '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="status-dot" [class]="a.status"></span>
                {{ a.status }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                <div class="row-actions">
                  <a mat-icon-button [routerLink]="['/assets', a.id, 'edit']"><mat-icon>edit</mat-icon></a>
                  <button mat-icon-button (click)="deleteAsset(a.id)"><mat-icon>delete_outline</mat-icon></button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          @if (!assets.length) {
            <div class="empty-state">
              <mat-icon>account_balance_wallet</mat-icon>
              <p>No assets found</p>
              <a routerLink="/assets/new" class="empty-action">Add your first asset</a>
            </div>
          }
        </div>

        @if (totalPages > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h1 { font-size: 28px; margin-bottom: 4px; }
      .subtitle { color: var(--text-secondary); font-size: 14px; }
    }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .filter-field { width: 180px; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
      border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      transition: all var(--transition-base); cursor: pointer; text-decoration: none; border: none;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; box-shadow: var(--shadow-gold); }
      &.primary:hover { transform: translateY(-1px); }
      &.outline { background: transparent; color: var(--accent-gold); border: 1px solid var(--border-gold); }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .loading { display: flex; justify-content: center; padding: 80px; }
    .error-panel {
      display: flex; flex-direction: column; align-items: center; padding: 60px;
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--accent-rose); margin-bottom: 12px; }
      p { color: var(--text-secondary); margin-bottom: 16px; }
    }

    .total-strip {
      display: flex; gap: 32px; padding: 18px 24px;
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); margin-bottom: 16px;
    }
    .total-item { display: flex; flex-direction: column; }
    .total-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .total-value { font-size: 22px; font-weight: 700; color: var(--accent-gold); }
    .total-count { font-size: 22px; font-weight: 700; color: var(--text-primary); }

    .table-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); overflow: hidden;
    }
    .cell-name { font-weight: 600; color: var(--text-primary); }
    .type-pill {
      font-size: 12px; font-weight: 500; color: var(--accent-blue-light);
      background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px;
    }
    .value-cell { font-weight: 600; color: var(--accent-emerald) !important; }
    .status-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px;
      &.active { background: var(--accent-emerald); }
      &.matured { background: var(--accent-amber); }
      &.sold { background: var(--accent-rose); }
      &.closed { background: var(--text-muted); }
    }
    .row-actions { display: flex; gap: 0; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; padding: 48px;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; margin-bottom: 8px; }
    }
    .empty-action { color: var(--accent-gold); font-weight: 500; font-size: 13px; }

    .pagination {
      display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px;
    }
    .page-btn {
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
      color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex;
      &:hover { border-color: var(--border-light); color: var(--text-primary); }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .page-info { font-size: 13px; color: var(--text-muted); }
  `],
})
export class AssetListComponent implements OnInit {
  assets: any[] = [];
  filterType = '';
  displayedColumns = ['name', 'asset_type', 'institution', 'current_value', 'maturity_date', 'status', 'actions'];
  totalValue = 0;
  loading = true;
  error = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadAssets(); }

  loadAssets() {
    this.loading = true;
    this.error = false;
    const params: Record<string, string> = { page: String(this.currentPage), limit: '25' };
    if (this.filterType) params['asset_type'] = this.filterType;

    this.api.getAssets(params).subscribe({
      next: (result) => {
        this.assets = result.data;
        this.totalItems = result.pagination.total;
        this.totalPages = result.pagination.totalPages;
        this.currentPage = result.pagination.page;
        this.totalValue = this.assets.reduce((sum, a) => sum + Number(a.current_value), 0);
        this.loading = false;
      },
      error: () => { this.loading = false; this.error = true; },
    });
  }

  goToPage(page: number) { this.currentPage = page; this.loadAssets(); }

  formatType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  deleteAsset(id: number) {
    if (confirm('Delete this asset?')) {
      this.api.deleteAsset(id).subscribe(() => this.loadAssets());
    }
  }
}
