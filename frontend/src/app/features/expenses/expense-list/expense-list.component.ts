import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { TitleCasePipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatSnackBarModule, BdtPipe, TitleCasePipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Expenses</h1>
          <p class="subtitle">Track your spending habits</p>
        </div>
        @if (monthTotal > 0) {
          <div class="header-stat">
            <span class="stat-label">This Month</span>
            <span class="stat-value">{{ monthTotal | bdt }}</span>
          </div>
        }
      </div>

      <!-- Add/Edit Form -->
      <div class="form-card">
        <h3 class="section-title">{{ editingId ? 'Edit Expense' : 'Add Expense' }}</h3>
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
              <mat-label>Amount (BDT)</mat-label>
              <input matInput formControlName="amount" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Frequency</mat-label>
              <mat-select formControlName="frequency">
                <mat-option value="daily">Daily</mat-option>
                <mat-option value="weekly">Weekly</mat-option>
                <mat-option value="monthly">Monthly</mat-option>
                <mat-option value="quarterly">Quarterly</mat-option>
                <mat-option value="yearly">Yearly</mat-option>
                <mat-option value="one_time">One Time</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput formControlName="date" type="date" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="notes-field">
              <mat-label>Notes</mat-label>
              <input matInput formControlName="notes" placeholder="Optional description" />
            </mat-form-field>
          </div>
          <div class="form-actions">
            @if (editingId) {
              <button type="button" class="action-btn secondary" (click)="cancelEdit()">Cancel</button>
            }
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon> {{ editingId ? 'Update' : 'Add Expense' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      @if (items.length) {
        <div class="table-card">
          <table mat-table [dataSource]="items">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let e">{{ e.date | date:'MMM d, y' }}</td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let e"><span class="type-pill">{{ formatType(e.category) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let e" class="value-neg">{{ e.amount | bdt }}</td>
            </ng-container>
            <ng-container matColumnDef="frequency">
              <th mat-header-cell *matHeaderCellDef>Frequency</th>
              <td mat-cell *matCellDef="let e"><span class="freq-badge">{{ formatType(e.frequency) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let e" class="notes-col">{{ e.notes || '---' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                <button mat-icon-button (click)="edit(e)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="deleteItem(e.id)"><mat-icon>delete_outline</mat-icon></button>
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
          <mat-icon>receipt</mat-icon>
          <p>No expenses recorded yet. Add your first expense above!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .header-stat { text-align: right; }
    .stat-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--accent-rose); }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    mat-form-field { flex: 1; min-width: 180px; }
    .notes-field { flex: 2; }
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
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .value-neg { font-weight: 600; color: var(--accent-rose) !important; }
    .freq-badge { font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 4px; }
    .notes-col { font-size: 12px; color: var(--text-muted) !important; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

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
export class ExpenseListComponent implements OnInit {
  items: any[] = [];
  form: FormGroup;
  editingId: number | null = null;
  monthTotal = 0;
  pagination = { page: 1, totalPages: 1 };
  columns = ['date', 'category', 'amount', 'frequency', 'notes', 'actions'];
  categories = ['housing', 'utilities', 'food', 'transportation', 'healthcare', 'education', 'clothing', 'entertainment', 'charity', 'zakat', 'insurance', 'household', 'personal', 'business', 'other'];

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      category: ['food', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      frequency: ['one_time'], date: [today, Validators.required], notes: [''],
    });
  }

  ngOnInit() { this.load(); }

  load(page = 1) {
    this.api.getExpenses({ page: String(page), limit: '15' }).subscribe(res => {
      this.items = res.data;
      this.pagination = { page: res.pagination.page, totalPages: res.pagination.totalPages };
      this.calcMonth();
    });
  }

  calcMonth() {
    const now = new Date();
    this.monthTotal = this.items
      .filter(e => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, e) => s + Number(e.amount), 0);
  }

  submit() {
    if (this.form.invalid) return;
    const val = { ...this.form.value };
    if (!val.notes) delete val.notes;

    const obs = this.editingId
      ? this.api.updateExpense(this.editingId, val)
      : this.api.createExpense(val);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Expense updated' : 'Expense added', 'OK', { duration: 3000 });
        this.cancelEdit();
        this.load();
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'OK', { duration: 3000 }),
    });
  }

  edit(item: any) {
    this.editingId = item.id;
    this.form.patchValue({
      category: item.category, amount: item.amount, frequency: item.frequency,
      date: item.date?.split('T')[0] || '', notes: item.notes || '',
    });
  }

  cancelEdit() {
    this.editingId = null;
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({ category: 'food', frequency: 'one_time', date: today });
  }

  deleteItem(id: number) {
    if (confirm('Delete this expense?')) {
      this.api.deleteExpense(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  goPage(p: number) { this.load(p); }
  formatType(t: string): string { return t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''; }
}
