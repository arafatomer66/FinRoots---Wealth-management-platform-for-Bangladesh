import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-inheritance-planner',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatTableModule, MatIconModule, BdtPipe, DecimalPipe, TitleCasePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Inheritance Planner</h1>
          <p class="subtitle">Calculate shares based on Bangladesh succession laws</p>
        </div>
      </div>

      <div class="form-card">
        <h3 class="section-title">Calculate Shares</h3>
        <form [formGroup]="form" (ngSubmit)="calculate()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Succession Law</mat-label>
              <mat-select formControlName="successionLaw">
                <mat-option value="muslim">Muslim (Hanafi)</mat-option>
                <mat-option value="hindu">Hindu (Dayabhaga)</mat-option>
                <mat-option value="christian">Christian (Succession Act 1925)</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Total Estate Value (BDT)</mat-label>
              <input matInput formControlName="estateValue" type="number" />
            </mat-form-field>
            @if (form.value.successionLaw === 'muslim') {
              <mat-form-field appearance="outline">
                <mat-label>Will Amount (max 1/3)</mat-label>
                <input matInput formControlName="willAmount" type="number" />
              </mat-form-field>
            }
          </div>
          <div class="form-actions-inline">
            @if (estateValue > 0) {
              <span class="estate-hint">Detected estate value: {{ estateValue | bdt }}</span>
            }
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>calculate</mat-icon> Calculate
            </button>
          </div>
        </form>
      </div>

      @if (result) {
        @if (result.notes?.length) {
          <div class="notes-card">
            @for (note of result.notes; track note) {
              <div class="note-row"><mat-icon>info_outline</mat-icon> {{ note }}</div>
            }
          </div>
        }

        <div class="table-card">
          <div class="table-header">
            <h3>Inheritance Distribution</h3>
          </div>
          <table mat-table [dataSource]="result.shares">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Heir</th>
              <td mat-cell *matCellDef="let s"><span class="cell-name">{{ s.name }}</span></td>
            </ng-container>
            <ng-container matColumnDef="relationship">
              <th mat-header-cell *matHeaderCellDef>Relationship</th>
              <td mat-cell *matCellDef="let s"><span class="type-pill">{{ s.relationship | titlecase }}</span></td>
            </ng-container>
            <ng-container matColumnDef="percentage">
              <th mat-header-cell *matHeaderCellDef>Share %</th>
              <td mat-cell *matCellDef="let s" class="value-gold">{{ s.percentage | number:'1.2-2' }}%</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let s" class="value-gold">{{ s.amount | bdt }}</td>
            </ng-container>
            <ng-container matColumnDef="basis">
              <th mat-header-cell *matHeaderCellDef>Legal Basis</th>
              <td mat-cell *matCellDef="let s" class="basis">{{ s.basis }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="resultColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: resultColumns;"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; }
    mat-form-field { flex: 1; }
    .form-actions-inline { display: flex; justify-content: space-between; align-items: center; }
    .estate-hint { font-size: 13px; color: var(--accent-emerald); }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .notes-card {
      background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.15);
      border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 16px;
    }
    .note-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; color: var(--accent-amber); font-size: 13px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }
    }
    .table-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .table-header { padding: 18px 24px; border-bottom: 1px solid var(--border-subtle); h3 { font-size: 15px; font-weight: 600; margin: 0; } }
    .cell-name { font-weight: 600; }
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .value-gold { font-weight: 600; color: var(--accent-gold) !important; }
    .basis { font-size: 12px; color: var(--text-muted) !important; }
  `],
})
export class InheritancePlannerComponent implements OnInit {
  form: FormGroup;
  result: any = null;
  resultColumns = ['name', 'relationship', 'percentage', 'amount', 'basis'];
  estateValue = 0;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({ successionLaw: ['muslim', Validators.required], estateValue: [null, [Validators.required, Validators.min(1)]], willAmount: [0] });
  }

  ngOnInit() {
    this.api.getEstateValue().subscribe(res => {
      this.estateValue = res.estateValue;
      if (this.estateValue > 0) this.form.patchValue({ estateValue: this.estateValue });
    });
  }

  calculate() {
    if (this.form.invalid) return;
    this.api.calculateInheritance(this.form.value).subscribe({
      next: (res) => this.result = res,
      error: (err) => alert(err.error?.error || 'Calculation failed'),
    });
  }
}
