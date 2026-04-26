import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, BdtPipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Budget Tracker</h1>
          <p class="subtitle">Set monthly spending limits by category</p>
        </div>
        <div class="month-nav">
          <button class="nav-btn" (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
          <span class="month-label">{{ monthNames[month - 1] }} {{ year }}</span>
          <button class="nav-btn" (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
        </div>
      </div>

      <!-- Summary -->
      @if (budgets.length) {
        <div class="summary-strip">
          <div class="summary-item">
            <span class="s-label">Total Budgeted</span>
            <span class="s-value">{{ totalBudgeted | bdt }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Total Spent</span>
            <span class="s-value spent">{{ totalSpent | bdt }}</span>
          </div>
          <div class="summary-item" [class.over]="totalRemaining < 0">
            <span class="s-label">Remaining</span>
            <span class="s-value">{{ totalRemaining | bdt }}</span>
          </div>
        </div>
      }

      <!-- Add Form -->
      <div class="form-card">
        <h3 class="section-title">{{ editingId ? 'Edit Budget' : 'Add Budget Category' }}</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                @for (c of categories; track c) {
                  <mat-option [value]="c">{{ formatType(c) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Monthly Limit (BDT)</mat-label>
              <input matInput formControlName="monthly_limit" type="number" />
            </mat-form-field>
            <div class="form-btns">
              @if (editingId) {
                <button type="button" class="action-btn secondary" (click)="cancelEdit()">Cancel</button>
              }
              <button type="submit" class="action-btn primary" [disabled]="form.invalid">
                <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon> {{ editingId ? 'Update' : 'Add' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Budget Cards -->
      @if (budgets.length) {
        <div class="budget-grid">
          @for (b of budgets; track b.id) {
            <div class="budget-card" [class.over-budget]="b.percentUsed > 100">
              <div class="budget-header">
                <span class="budget-cat">{{ formatType(b.category) }}</span>
                <div class="budget-actions">
                  <button mat-icon-button (click)="edit(b)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button (click)="deleteBudget(b.id)"><mat-icon>delete_outline</mat-icon></button>
                </div>
              </div>
              <div class="budget-amounts">
                <span class="spent-amt">{{ b.spent | bdt }}</span>
                <span class="of">of</span>
                <span class="limit-amt">{{ b.monthly_limit | bdt }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [class.warning]="b.percentUsed > 75 && b.percentUsed <= 100" [class.danger]="b.percentUsed > 100"
                     [style.width.%]="Math.min(100, b.percentUsed)"></div>
              </div>
              <div class="budget-footer">
                <span class="pct" [class.over]="b.percentUsed > 100">{{ b.percentUsed | number:'1.0-0' }}% used</span>
                <span class="remaining" [class.over]="b.remaining < 0">{{ b.remaining | bdt }} left</span>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>pie_chart</mat-icon>
          <p>No budgets set for {{ monthNames[month - 1] }} {{ year }}. Add one above!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .month-nav { display: flex; align-items: center; gap: 12px; }
    .nav-btn {
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
      padding: 6px; cursor: pointer; color: var(--text-secondary);
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .month-label { font-size: 15px; font-weight: 600; color: var(--text-primary); min-width: 120px; text-align: center; }

    .summary-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-item {
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      padding: 18px; text-align: center;
      &.over { border-color: rgba(251,113,133,0.3); }
    }
    .s-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .s-value { display: block; font-size: 20px; font-weight: 700; color: var(--text-primary); &.spent { color: var(--accent-amber); } }
    .summary-item.over .s-value { color: var(--accent-rose); }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    mat-form-field { flex: 1; min-width: 180px; }
    .form-btns { display: flex; gap: 8px; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &.secondary { background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .budget-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .budget-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      padding: 20px; transition: all var(--transition-base);
      &:hover { border-color: var(--border-light); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
      &.over-budget { border-color: rgba(251,113,133,0.3); }
    }
    .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .budget-cat { font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .budget-actions { display: flex; }
    .budget-amounts { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
    .spent-amt { font-weight: 700; color: var(--text-primary); }
    .of { color: var(--text-muted); margin: 0 4px; }
    .limit-amt { color: var(--text-muted); }

    .progress-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
    .progress-fill {
      height: 100%; border-radius: 3px; transition: width 0.5s ease;
      background: linear-gradient(90deg, var(--accent-gold-dark), var(--accent-gold));
      &.warning { background: linear-gradient(90deg, var(--accent-amber), #f59e0b); }
      &.danger { background: linear-gradient(90deg, var(--accent-rose), #ef4444); }
    }
    .budget-footer { display: flex; justify-content: space-between; font-size: 12px; }
    .pct { color: var(--text-muted); &.over { color: var(--accent-rose); font-weight: 600; } }
    .remaining { color: var(--accent-emerald); &.over { color: var(--accent-rose); } }

    .empty-card {
      display: flex; flex-direction: column; align-items: center; padding: 60px;
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }

    @media (max-width: 900px) { .budget-grid { grid-template-columns: 1fr; } .summary-strip { grid-template-columns: 1fr; } }
  `],
})
export class BudgetListComponent implements OnInit {
  budgets: any[] = [];
  form: FormGroup;
  editingId: number | null = null;
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  totalBudgeted = 0;
  totalSpent = 0;
  totalRemaining = 0;
  Math = Math;
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  categories = ['housing', 'utilities', 'food', 'transportation', 'healthcare', 'education', 'clothing', 'entertainment', 'charity', 'zakat', 'insurance', 'household', 'personal', 'business', 'other'];

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      category: ['food', Validators.required],
      monthly_limit: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getBudgets({ year: String(this.year), month: String(this.month) }).subscribe(res => {
      this.budgets = res.data;
      this.totalBudgeted = this.budgets.reduce((s, b) => s + Number(b.monthly_limit), 0);
      this.totalSpent = this.budgets.reduce((s, b) => s + b.spent, 0);
      this.totalRemaining = this.totalBudgeted - this.totalSpent;
    });
  }

  submit() {
    if (this.form.invalid) return;
    const val = { ...this.form.value, year: this.year, month: this.month };

    const obs = this.editingId
      ? this.api.updateBudget(this.editingId, val)
      : this.api.createBudget(val);

    obs.subscribe({
      next: () => { this.snackBar.open(this.editingId ? 'Budget updated' : 'Budget added', 'OK', { duration: 3000 }); this.cancelEdit(); this.load(); },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'OK', { duration: 3000 }),
    });
  }

  edit(b: any) {
    this.editingId = b.id;
    this.form.patchValue({ category: b.category, monthly_limit: b.monthly_limit });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ category: 'food' });
  }

  deleteBudget(id: number) {
    if (confirm('Delete this budget?')) {
      this.api.deleteBudget(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  prevMonth() {
    this.month--;
    if (this.month < 1) { this.month = 12; this.year--; }
    this.load();
  }

  nextMonth() {
    this.month++;
    if (this.month > 12) { this.month = 1; this.year++; }
    this.load();
  }

  formatType(t: string): string { return t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''; }
}
