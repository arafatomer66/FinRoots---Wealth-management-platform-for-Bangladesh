import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-zakat-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatChipsModule, MatIconModule, BdtPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Zakat Calculator</h1>
          <p class="subtitle">Calculate your annual Zakat obligation based on current assets</p>
        </div>
      </div>

      <!-- Input -->
      <div class="form-card">
        <h3 class="section-title">Current Market Prices</h3>
        <p class="hint">Enter today's gold and silver prices to calculate Nisab threshold</p>
        <form [formGroup]="form" (ngSubmit)="calculate()">
          <div class="input-row">
            <mat-form-field appearance="outline">
              <mat-label>Gold Price per Gram (BDT)</mat-label>
              <input matInput formControlName="goldPricePerGram" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Silver Price per Gram (BDT)</mat-label>
              <input matInput formControlName="silverPricePerGram" type="number" />
            </mat-form-field>
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>calculate</mat-icon> Calculate Zakat
            </button>
          </div>
        </form>
      </div>

      @if (result) {
        <!-- Nisab -->
        <div class="nisab-strip">
          <div class="nisab-item">
            <span class="nisab-label">Gold Nisab (87.48g)</span>
            <span class="nisab-value">{{ result.nisabGold | bdt }}</span>
          </div>
          <div class="nisab-item">
            <span class="nisab-label">Silver Nisab (612.36g)</span>
            <span class="nisab-value">{{ result.nisabSilver | bdt }}</span>
          </div>
          <div class="nisab-item highlight">
            <span class="nisab-label">Nisab Threshold</span>
            <span class="nisab-value gold">{{ result.nisabThresholdBDT | bdt }}</span>
          </div>
        </div>

        <!-- Result -->
        <div class="result-card" [class.eligible]="result.isEligible" [class.not-eligible]="!result.isEligible">
          <div class="result-hero">
            @if (result.isEligible) {
              <div class="result-icon eligible-icon"><mat-icon>volunteer_activism</mat-icon></div>
              <h2>Zakat is Due</h2>
              <div class="zakat-amount">{{ result.zakatDue | bdt }}</div>
              <p class="result-sub">2.5% of your net zakatable wealth</p>
            } @else {
              <div class="result-icon"><mat-icon>check_circle_outline</mat-icon></div>
              <h2>Zakat is Not Due</h2>
              <p class="result-sub">Your net zakatable wealth ({{ result.netZakatableWealth | bdt }}) is below Nisab</p>
            }
          </div>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Total Zakatable Assets</span>
              <span>{{ result.totalZakatableWealth | bdt }}</span>
            </div>
            <div class="summary-row">
              <span>Deductions (immediate debts)</span>
              <span class="neg">- {{ result.totalDeductions | bdt }}</span>
            </div>
            <div class="summary-row net">
              <span>Net Zakatable Wealth</span>
              <span>{{ result.netZakatableWealth | bdt }}</span>
            </div>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="table-card">
          <div class="table-header"><h3>Asset Breakdown</h3></div>
          <table mat-table [dataSource]="result.breakdown">
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Asset</th>
              <td mat-cell *matCellDef="let b"><span class="cell-name">{{ b.description }}</span></td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let b"><span class="type-pill">{{ formatType(b.category) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let b">{{ b.value | bdt }}</td>
            </ng-container>
            <ng-container matColumnDef="isZakatable">
              <th mat-header-cell *matHeaderCellDef>Zakatable</th>
              <td mat-cell *matCellDef="let b">
                <span class="zakat-badge" [class.yes]="b.isZakatable" [class.no]="!b.isZakatable">
                  {{ b.isZakatable ? 'Yes' : 'No' }}
                </span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="breakdownColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: breakdownColumns;"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px; }
    .hint { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
    .input-row { display: flex; gap: 16px; align-items: center; }
    mat-form-field { flex: 1; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer; white-space: nowrap;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .nisab-strip {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;
    }
    .nisab-item {
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      padding: 18px; text-align: center;
      &.highlight { border-color: var(--border-gold); background: rgba(212,168,83,0.04); }
    }
    .nisab-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .nisab-value { display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); &.gold { color: var(--accent-gold); } }

    .result-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      padding: 32px; margin-bottom: 20px;
      &.eligible { border-color: rgba(52,211,153,0.3); }
    }
    .result-hero { text-align: center; margin-bottom: 28px; }
    .result-icon {
      width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; background: rgba(255,255,255,0.05);
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--text-muted); }
      &.eligible-icon { background: rgba(52,211,153,0.12); mat-icon { color: var(--accent-emerald); } }
    }
    .result-hero h2 { font-size: 22px; margin-bottom: 8px; }
    .zakat-amount { font-size: 40px; font-weight: 800; color: var(--accent-gold); margin: 8px 0; }
    .result-sub { font-size: 14px; color: var(--text-secondary); }

    .summary-rows { max-width: 500px; margin: 0 auto; }
    .summary-row {
      display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);
      font-size: 13px; color: var(--text-secondary);
      span:last-child { font-weight: 600; color: var(--text-primary); }
      .neg { color: var(--accent-rose) !important; }
      &.net { font-weight: 700; background: rgba(255,255,255,0.03); padding: 14px; border-radius: var(--radius-sm); margin-top: 8px;
        span:first-child { color: var(--text-primary); } span:last-child { color: var(--accent-gold); font-size: 16px; } }
    }

    .table-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .table-header { padding: 18px 24px; border-bottom: 1px solid var(--border-subtle); h3 { font-size: 15px; font-weight: 600; margin: 0; } }
    .cell-name { font-weight: 600; }
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .zakat-badge {
      font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 6px;
      &.yes { color: var(--accent-emerald); background: rgba(52,211,153,0.1); }
      &.no { color: var(--text-muted); background: rgba(255,255,255,0.04); }
    }
  `],
})
export class ZakatCalculatorComponent {
  form: FormGroup;
  result: any = null;
  breakdownColumns = ['description', 'category', 'value', 'isZakatable'];

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      goldPricePerGram: [9500, [Validators.required, Validators.min(1)]],
      silverPricePerGram: [130, [Validators.required, Validators.min(1)]],
    });
  }

  calculate() {
    if (this.form.invalid) return;
    this.api.calculateZakat(this.form.value).subscribe({
      next: (res) => this.result = res,
      error: (err) => alert(err.error?.error || 'Calculation failed'),
    });
  }

  formatType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
