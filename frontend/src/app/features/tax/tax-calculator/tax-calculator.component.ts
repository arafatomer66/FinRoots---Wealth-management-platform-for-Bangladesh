import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-tax-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatTableModule, MatIconModule, BdtPipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Income Tax Calculator</h1>
          <p class="subtitle">NBR Assessment Year 2026-27 (Income Year 2025-26)</p>
        </div>
      </div>

      <div class="calculator-grid">
        <!-- Input -->
        <div class="form-card">
          <h3 class="section-title">Your Details</h3>
          <form [formGroup]="form" (ngSubmit)="calculate()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Total Annual Income (BDT)</mat-label>
              <input matInput formControlName="totalIncome" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="male">Male</mat-option>
                <mat-option value="female">Female</mat-option>
                <mat-option value="third_gender">Third Gender</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date of Birth</mat-label>
              <input matInput formControlName="dateOfBirth" type="date" />
            </mat-form-field>
            <mat-checkbox formControlName="isDisabled" class="checkbox">Physically Challenged</mat-checkbox>
            <mat-checkbox formControlName="isNewTaxpayer" class="checkbox">New Taxpayer</mat-checkbox>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Total Investment (for rebate)</mat-label>
              <input matInput formControlName="totalInvestment" type="number" />
            </mat-form-field>
            @if (rebateEligible > 0) {
              <div class="info-row"><mat-icon>info_outline</mat-icon> Auto-detected investments: {{ rebateEligible | bdt }}</div>
            }
            <button type="submit" class="action-btn primary full-width" [disabled]="form.invalid">
              <mat-icon>calculate</mat-icon> Calculate Tax
            </button>
          </form>
        </div>

        <!-- Result -->
        @if (result) {
          <div class="result-card">
            <h3 class="section-title">Tax Calculation</h3>
            <div class="summary-rows">
              <div class="summary-row"><span>Total Income</span><span>{{ result.totalIncome | bdt }}</span></div>
              <div class="summary-row"><span>Tax-Free Threshold</span><span>{{ result.taxFreeThreshold | bdt }}</span></div>
              <div class="summary-row"><span>Taxable Income</span><span>{{ result.taxableIncome | bdt }}</span></div>
              <div class="summary-row highlight"><span>Gross Tax</span><span>{{ result.grossTax | bdt }}</span></div>
              <div class="summary-row positive"><span>Investment Rebate</span><span>- {{ result.investmentRebate | bdt }}</span></div>
              <div class="summary-row final">
                <span>Final Tax Payable</span>
                <span class="final-value">{{ result.finalTax | bdt }}</span>
              </div>
            </div>

            <h3 class="section-title" style="margin-top: 24px">Slab Breakdown</h3>
            <table mat-table [dataSource]="result.slabBreakdown">
              <ng-container matColumnDef="slab"><th mat-header-cell *matHeaderCellDef>Slab</th><td mat-cell *matCellDef="let s">{{ s.slab }}</td></ng-container>
              <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let s">{{ s.amount | bdt }}</td></ng-container>
              <ng-container matColumnDef="rate"><th mat-header-cell *matHeaderCellDef>Rate</th><td mat-cell *matCellDef="let s">{{ s.rate * 100 }}%</td></ng-container>
              <ng-container matColumnDef="tax"><th mat-header-cell *matHeaderCellDef>Tax</th><td mat-cell *matCellDef="let s" class="value-gold">{{ s.tax | bdt }}</td></ng-container>
              <tr mat-header-row *matHeaderRowDef="slabColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: slabColumns;"></tr>
            </table>

            @if (result.minimumTax > result.netTax) {
              <div class="info-row warn"><mat-icon>warning</mat-icon> Minimum tax of {{ result.minimumTax | bdt }} applied</div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .calculator-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
    .form-card, .result-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .checkbox { display: block; margin: 8px 0; }
    .info-row {
      display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--accent-emerald); margin: 12px 0;
      &.warn { color: var(--accent-amber); }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .action-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 24px;
      border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .summary-rows { display: flex; flex-direction: column; gap: 2px; }
    .summary-row {
      display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);
      font-size: 13px; color: var(--text-secondary);
      span:last-child { font-weight: 600; color: var(--text-primary); }
    }
    .summary-row.highlight span:last-child { color: var(--accent-amber); }
    .summary-row.positive span:last-child { color: var(--accent-emerald); }
    .summary-row.final {
      background: rgba(212,168,83,0.06); padding: 14px; border-radius: var(--radius-sm);
      border: 1px solid var(--border-gold); margin-top: 8px;
      span:first-child { font-weight: 600; color: var(--text-primary); }
    }
    .final-value { font-size: 20px !important; color: var(--accent-gold) !important; }
    .value-gold { font-weight: 600; color: var(--accent-gold) !important; }
    @media (max-width: 900px) { .calculator-grid { grid-template-columns: 1fr; } }
  `],
})
export class TaxCalculatorComponent implements OnInit {
  form: FormGroup;
  result: any = null;
  slabColumns = ['slab', 'amount', 'rate', 'tax'];
  rebateEligible = 0;

  constructor(private fb: FormBuilder, private api: ApiService, private auth: AuthService) {
    const user = this.auth.user();
    this.form = this.fb.group({
      totalIncome: [null, [Validators.required, Validators.min(0)]],
      gender: [user?.gender || 'male'], dateOfBirth: [user?.date_of_birth || ''],
      isDisabled: [false], isNewTaxpayer: [false], totalInvestment: [0],
    });
  }

  ngOnInit() {
    this.api.getRebateInvestment().subscribe(res => {
      this.rebateEligible = res.rebateEligibleInvestment;
      if (this.rebateEligible > 0) this.form.patchValue({ totalInvestment: this.rebateEligible });
    });
  }

  calculate() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.api.calculateTax({
      totalIncome: v.totalIncome,
      taxpayer: { gender: v.gender, date_of_birth: v.dateOfBirth, is_disabled: v.isDisabled, is_third_gender: v.gender === 'third_gender', is_new_taxpayer: v.isNewTaxpayer },
      totalInvestment: v.totalInvestment,
    }).subscribe({ next: (res) => this.result = res, error: (err) => alert(err.error?.error || 'Calculation failed') });
  }
}
