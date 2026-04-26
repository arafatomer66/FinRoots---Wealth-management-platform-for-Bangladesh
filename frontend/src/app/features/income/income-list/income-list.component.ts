import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { TitleCasePipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatCheckboxModule, MatSnackBarModule, BdtPipe, TitleCasePipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Income</h1>
          <p class="subtitle">Track all your income sources</p>
        </div>
        @if (totalMonthly > 0) {
          <div class="header-stat">
            <span class="stat-label">Est. Monthly</span>
            <span class="stat-value">{{ totalMonthly | bdt }}</span>
          </div>
        }
      </div>

      <!-- Add/Edit Form -->
      <div class="form-card">
        <h3 class="section-title">{{ editingId ? 'Edit Income' : 'Add Income Source' }}</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Source</mat-label>
              <input matInput formControlName="source" placeholder="e.g., Acme Corp Salary" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                @for (t of incomeTypes; track t) {
                  <mat-option [value]="t">{{ formatType(t) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Amount (BDT)</mat-label>
              <input matInput formControlName="amount" type="number" />
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Frequency</mat-label>
              <mat-select formControlName="frequency">
                <mat-option value="monthly">Monthly</mat-option>
                <mat-option value="quarterly">Quarterly</mat-option>
                <mat-option value="yearly">Yearly</mat-option>
                <mat-option value="one_time">One Time</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput formControlName="start_date" type="date" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput formControlName="end_date" type="date" />
            </mat-form-field>
          </div>
          <div class="form-row-bottom">
            <mat-checkbox formControlName="is_taxable">Taxable Income</mat-checkbox>
            <mat-form-field appearance="outline" class="notes-field">
              <mat-label>Notes</mat-label>
              <input matInput formControlName="notes" />
            </mat-form-field>
          </div>
          <div class="form-actions">
            @if (editingId) {
              <button type="button" class="action-btn secondary" (click)="cancelEdit()">Cancel</button>
            }
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon> {{ editingId ? 'Update' : 'Add Income' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      @if (items.length) {
        <div class="table-card">
          <table mat-table [dataSource]="items">
            <ng-container matColumnDef="source">
              <th mat-header-cell *matHeaderCellDef>Source</th>
              <td mat-cell *matCellDef="let i"><span class="cell-name">{{ i.source }}</span></td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let i"><span class="type-pill">{{ formatType(i.type) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let i" class="value-pos">{{ i.amount | bdt }}</td>
            </ng-container>
            <ng-container matColumnDef="frequency">
              <th mat-header-cell *matHeaderCellDef>Frequency</th>
              <td mat-cell *matCellDef="let i"><span class="freq-badge">{{ formatType(i.frequency) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="is_taxable">
              <th mat-header-cell *matHeaderCellDef>Taxable</th>
              <td mat-cell *matCellDef="let i">
                <span class="tax-badge" [class.yes]="i.is_taxable" [class.no]="!i.is_taxable">{{ i.is_taxable ? 'Yes' : 'No' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let i">
                <button mat-icon-button (click)="edit(i)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="deleteItem(i.id)"><mat-icon>delete_outline</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
          @if (pagination.totalPages > 1) {
            <div class="pagination">
              <button class="page-btn" [disabled]="pagination.page <= 1" (click)="goPage(pagination.page - 1)">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="page-info">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
              <button class="page-btn" [disabled]="pagination.page >= pagination.totalPages" (click)="goPage(pagination.page + 1)">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>trending_up</mat-icon>
          <p>No income sources yet. Add your first income above!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .header-stat { text-align: right; }
    .stat-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--accent-emerald); }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    mat-form-field { flex: 1; min-width: 180px; }
    .form-row-bottom { display: flex; align-items: center; gap: 24px; margin-top: 4px; }
    .notes-field { flex: 1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &.secondary { background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .table-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .cell-name { font-weight: 600; }
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .value-pos { font-weight: 600; color: var(--accent-emerald) !important; }
    .freq-badge { font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 4px; }
    .tax-badge {
      font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 6px;
      &.yes { color: var(--accent-amber); background: rgba(251,191,36,0.1); }
      &.no { color: var(--text-muted); background: rgba(255,255,255,0.04); }
    }

    .pagination {
      display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px;
      border-top: 1px solid var(--border-subtle);
    }
    .page-btn {
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
      padding: 6px; cursor: pointer; color: var(--text-secondary);
      &:disabled { opacity: 0.3; cursor: default; }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .page-info { font-size: 13px; color: var(--text-muted); }

    .empty-card {
      display: flex; flex-direction: column; align-items: center; padding: 60px;
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }
  `],
})
export class IncomeListComponent implements OnInit {
  items: any[] = [];
  form: FormGroup;
  editingId: number | null = null;
  totalMonthly = 0;
  pagination = { page: 1, totalPages: 1 };
  columns = ['source', 'type', 'amount', 'frequency', 'is_taxable', 'actions'];
  incomeTypes = ['salary', 'business', 'rental', 'dividend', 'interest', 'freelance', 'agricultural', 'capital_gain', 'other'];

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      source: ['', Validators.required], type: ['salary', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]], frequency: ['monthly'],
      start_date: [''], end_date: [''], is_taxable: [true], notes: [''],
    });
  }

  ngOnInit() { this.load(); }

  load(page = 1) {
    this.api.getIncome({ page: String(page), limit: '15' }).subscribe(res => {
      this.items = res.data;
      this.pagination = { page: res.pagination.page, totalPages: res.pagination.totalPages };
      this.calcMonthly();
    });
  }

  calcMonthly() {
    this.totalMonthly = this.items.reduce((sum, i) => {
      const amt = Number(i.amount);
      switch (i.frequency) {
        case 'monthly': return sum + amt;
        case 'quarterly': return sum + amt / 3;
        case 'yearly': return sum + amt / 12;
        default: return sum;
      }
    }, 0);
  }

  submit() {
    if (this.form.invalid) return;
    const val = this.form.value;
    if (!val.start_date) delete val.start_date;
    if (!val.end_date) delete val.end_date;
    if (!val.notes) delete val.notes;

    const obs = this.editingId
      ? this.api.updateIncome(this.editingId, val)
      : this.api.createIncome(val);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Income updated' : 'Income added', 'OK', { duration: 3000 });
        this.cancelEdit();
        this.load();
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'OK', { duration: 3000 }),
    });
  }

  edit(item: any) {
    this.editingId = item.id;
    this.form.patchValue({
      source: item.source, type: item.type, amount: item.amount, frequency: item.frequency,
      start_date: item.start_date?.split('T')[0] || '', end_date: item.end_date?.split('T')[0] || '',
      is_taxable: item.is_taxable, notes: item.notes || '',
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ type: 'salary', frequency: 'monthly', is_taxable: true });
  }

  deleteItem(id: number) {
    if (confirm('Delete this income source?')) {
      this.api.deleteIncome(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  goPage(p: number) { this.load(p); }
  formatType(t: string): string { return t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''; }
}
