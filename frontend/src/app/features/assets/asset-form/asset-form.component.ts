import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Edit Asset' : 'Add New Asset' }}</h1>
          <p class="subtitle">{{ isEdit ? 'Update asset details' : 'Enter your asset information' }}</p>
        </div>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Asset Type</mat-label>
                <mat-select formControlName="asset_type">
                  <mat-option value="sanchayapatra">Sanchayapatra</mat-option>
                  <mat-option value="fdr">Fixed Deposit (FDR)</mat-option>
                  <mat-option value="dps">DPS</mat-option>
                  <mat-option value="stock">Stocks</mat-option>
                  <mat-option value="mutual_fund">Mutual Fund</mat-option>
                  <mat-option value="gold">Gold</mat-option>
                  <mat-option value="real_estate">Real Estate</mat-option>
                  <mat-option value="insurance">Insurance</mat-option>
                  <mat-option value="bond">Bond</mat-option>
                  <mat-option value="cash_bank">Cash / Bank Account</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Asset Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g., BRAC Bank FDR" />
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Institution</mat-label>
                <input matInput formControlName="institution" placeholder="e.g., Dutch Bangla Bank" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Interest Rate (%)</mat-label>
                <input matInput formControlName="interest_rate" type="number" />
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Valuation</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Purchase Value (BDT)</mat-label>
                <input matInput formControlName="purchase_value" type="number" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Current Value (BDT)</mat-label>
                <input matInput formControlName="current_value" type="number" />
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Purchase Date</mat-label>
                <input matInput [matDatepicker]="purchasePicker" formControlName="purchase_date" />
                <mat-datepicker-toggle matSuffix [for]="purchasePicker"></mat-datepicker-toggle>
                <mat-datepicker #purchasePicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Maturity Date</mat-label>
                <input matInput [matDatepicker]="maturityPicker" formControlName="maturity_date" />
                <mat-datepicker-toggle matSuffix [for]="maturityPicker"></mat-datepicker-toggle>
                <mat-datepicker #maturityPicker></mat-datepicker>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button type="button" class="action-btn outline" (click)="cancel()">Cancel</button>
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
              {{ isEdit ? 'Update Asset' : 'Add Asset' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 800px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .form-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); padding: 32px;
    }
    .form-section { margin-bottom: 28px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-subtle); }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px;
      border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      transition: all var(--transition-base); cursor: pointer; border: none;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &.outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-light); }
      &:disabled { opacity: 0.5; cursor: default; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
})
export class AssetFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  assetId?: number;

  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({
      asset_type: ['', Validators.required],
      name: ['', Validators.required],
      institution: [''],
      interest_rate: [null],
      purchase_value: [null],
      current_value: [null, [Validators.required, Validators.min(0)]],
      purchase_date: [null],
      maturity_date: [null],
      notes: [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.assetId = Number(id);
      this.api.getAsset(this.assetId).subscribe(asset => this.form.patchValue(asset));
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const obs = this.isEdit ? this.api.updateAsset(this.assetId!, this.form.value) : this.api.createAsset(this.form.value);
    obs.subscribe({ next: () => this.router.navigate(['/assets']), error: (err) => alert(err.error?.error || 'Failed to save') });
  }

  cancel() { this.router.navigate(['/assets']); }
}
