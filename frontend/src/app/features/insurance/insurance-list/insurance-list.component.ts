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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-insurance-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, BdtPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Insurance Policies</h1>
          <p class="subtitle">Life, health, vehicle and property coverage</p>
        </div>
      </div>

      @if (summary) {
        <div class="summary-strip">
          <div class="summary-item">
            <span class="s-label">Active Policies</span>
            <span class="s-value">{{ summary.activePolicies }} / {{ summary.totalPolicies }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Total Sum Assured</span>
            <span class="s-value gold">{{ summary.totalSumAssured | bdt }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Annual Premium</span>
            <span class="s-value">{{ summary.annualPremium | bdt }}</span>
          </div>
          <div class="summary-item" [class.warn]="summary.upcomingPremiums?.length">
            <span class="s-label">Due in 30 days</span>
            <span class="s-value">{{ summary.upcomingPremiums?.length || 0 }}</span>
          </div>
        </div>
      }

      <div class="form-card">
        <h3 class="section-title">{{ editingId ? 'Edit Policy' : 'Add Policy' }}</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                @for (t of types; track t) {
                  <mat-option [value]="t">{{ format(t) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Insurer</mat-label>
              <input matInput formControlName="insurer" placeholder="MetLife, Pragati, ..." />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Policy Number</mat-label>
              <input matInput formControlName="policy_number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Coverage For</mat-label>
              <input matInput formControlName="coverage_for" placeholder="Self, family, vehicle reg, ..." />
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Sum Assured (BDT)</mat-label>
              <input matInput formControlName="sum_assured" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Premium (BDT)</mat-label>
              <input matInput formControlName="premium" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Premium Frequency</mat-label>
              <mat-select formControlName="premium_frequency">
                @for (f of frequencies; track f) {
                  <mat-option [value]="f">{{ format(f) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Beneficiary</mat-label>
              <input matInput formControlName="beneficiary" />
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput formControlName="start_date" type="date" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Maturity Date</mat-label>
              <input matInput formControlName="maturity_date" type="date" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Next Premium Date</mat-label>
              <input matInput formControlName="next_premium_date" type="date" />
            </mat-form-field>
          </div>
          <div class="form-btns">
            @if (editingId) { <button type="button" class="action-btn secondary" (click)="cancelEdit()">Cancel</button> }
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon> {{ editingId ? 'Update' : 'Add Policy' }}
            </button>
          </div>
        </form>
      </div>

      @if (policies.length) {
        <div class="policy-grid">
          @for (p of policies; track p.id) {
            <div class="policy-card" [class.inactive]="!p.is_active">
              <div class="card-head">
                <div class="type-chip" [class]="'type-' + p.type">{{ format(p.type) }}</div>
                <div class="card-actions">
                  <button mat-icon-button (click)="edit(p)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button (click)="del(p.id)"><mat-icon>delete_outline</mat-icon></button>
                </div>
              </div>
              <div class="insurer">{{ p.insurer }}</div>
              <div class="policy-no">{{ p.policy_number }}</div>
              <div class="amounts">
                <div class="amt-row"><span>Sum Assured</span><strong class="gold">{{ p.sum_assured | bdt }}</strong></div>
                <div class="amt-row"><span>Premium</span><strong>{{ p.premium | bdt }} / {{ format(p.premium_frequency) }}</strong></div>
                @if (p.next_premium_date) {
                  <div class="amt-row" [class.due-soon]="isDueSoon(p.next_premium_date)">
                    <span>Next Premium</span><strong>{{ p.next_premium_date | date:'mediumDate' }}</strong>
                  </div>
                }
                @if (p.maturity_date) {
                  <div class="amt-row"><span>Matures</span><strong>{{ p.maturity_date | date:'mediumDate' }}</strong></div>
                }
                @if (p.beneficiary) {
                  <div class="amt-row"><span>Beneficiary</span><strong>{{ p.beneficiary }}</strong></div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>shield</mat-icon>
          <p>No policies tracked. Add your first one above.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }

    .summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-item { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; text-align: center;
      &.warn { border-color: rgba(245,158,11,0.3); }
    }
    .s-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .s-value { display: block; font-size: 20px; font-weight: 700; color: var(--text-primary); &.gold { color: var(--accent-gold); } }
    .summary-item.warn .s-value { color: var(--accent-amber); }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
    mat-form-field { flex: 1; min-width: 160px; }
    .form-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &.secondary { background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .policy-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .policy-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px;
      &:hover { border-color: var(--border-light); }
      &.inactive { opacity: 0.55; }
    }
    .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .type-chip { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;
      &.type-life { background: rgba(212,168,83,0.15); color: var(--accent-gold); }
      &.type-health { background: rgba(52,211,153,0.15); color: var(--accent-emerald); }
      &.type-vehicle { background: rgba(96,165,250,0.15); color: #60a5fa; }
      &.type-property { background: rgba(167,139,250,0.15); color: #a78bfa; }
      &.type-travel { background: rgba(244,114,182,0.15); color: #f472b6; }
      &.type-other { background: rgba(255,255,255,0.08); color: var(--text-secondary); }
    }
    .insurer { font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
    .policy-no { font-size: 12px; color: var(--text-muted); margin-bottom: 14px; font-family: ui-monospace, monospace; }
    .amounts { display: flex; flex-direction: column; gap: 8px; }
    .amt-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-top: 1px solid var(--border-subtle);
      span { color: var(--text-muted); }
      strong { color: var(--text-primary); &.gold { color: var(--accent-gold); } }
      &.due-soon strong { color: var(--accent-amber); }
    }

    .empty-card { display: flex; flex-direction: column; align-items: center; padding: 60px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }

    @media (max-width: 900px) { .summary-strip, .policy-grid { grid-template-columns: 1fr; } }
  `],
})
export class InsuranceListComponent implements OnInit {
  policies: any[] = [];
  summary: any = null;
  form: FormGroup;
  editingId: number | null = null;
  types = ['life', 'health', 'vehicle', 'property', 'travel', 'other'];
  frequencies = ['monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time'];

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      type: ['life', Validators.required],
      insurer: ['', Validators.required],
      policy_number: ['', Validators.required],
      coverage_for: [''],
      sum_assured: [null, [Validators.required, Validators.min(1)]],
      premium: [null, [Validators.required, Validators.min(0)]],
      premium_frequency: ['yearly', Validators.required],
      beneficiary: [''],
      start_date: [new Date().toISOString().slice(0, 10), Validators.required],
      maturity_date: [null],
      next_premium_date: [null],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getInsurance().subscribe(rows => { this.policies = rows; });
    this.api.getInsuranceSummary().subscribe(s => { this.summary = s; });
  }

  submit() {
    if (this.form.invalid) return;
    const payload = { ...this.form.value };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    const obs = this.editingId ? this.api.updateInsurance(this.editingId, payload) : this.api.createInsurance(payload);
    obs.subscribe({
      next: () => { this.snackBar.open(this.editingId ? 'Updated' : 'Added', 'OK', { duration: 2500 }); this.cancelEdit(); this.load(); },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'OK', { duration: 3000 }),
    });
  }

  edit(p: any) {
    this.editingId = p.id;
    this.form.patchValue({
      type: p.type, insurer: p.insurer, policy_number: p.policy_number, coverage_for: p.coverage_for,
      sum_assured: p.sum_assured, premium: p.premium, premium_frequency: p.premium_frequency,
      beneficiary: p.beneficiary,
      start_date: (p.start_date || '').slice(0, 10),
      maturity_date: (p.maturity_date || '').slice(0, 10) || null,
      next_premium_date: (p.next_premium_date || '').slice(0, 10) || null,
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ type: 'life', premium_frequency: 'yearly', start_date: new Date().toISOString().slice(0, 10) });
  }

  del(id: number) {
    if (confirm('Delete this policy?')) {
      this.api.deleteInsurance(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  isDueSoon(date: string): boolean {
    if (!date) return false;
    const days = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }

  format(t: string): string { return t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''; }
}
