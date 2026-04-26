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
  selector: 'app-investment-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, BdtPipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Stock Portfolio</h1>
          <p class="subtitle">DSE / CSE holdings, prices updated manually</p>
        </div>
      </div>

      @if (summary) {
        <div class="summary-strip">
          <div class="summary-item">
            <span class="s-label">Invested</span>
            <span class="s-value">{{ summary.totalInvested | bdt }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Market Value</span>
            <span class="s-value gold">{{ summary.totalMarketValue | bdt }}</span>
          </div>
          <div class="summary-item" [class.up]="summary.totalGainLoss >= 0" [class.down]="summary.totalGainLoss < 0">
            <span class="s-label">Gain / Loss</span>
            <span class="s-value">{{ summary.totalGainLoss | bdt }} ({{ summary.totalGainPercent | number:'1.1-2' }}%)</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Holdings</span>
            <span class="s-value">{{ summary.holdingsCount }}</span>
          </div>
        </div>
      }

      <div class="form-card">
        <h3 class="section-title">{{ editingId ? 'Edit Holding' : 'Add Holding' }}</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Ticker</mat-label>
              <input matInput formControlName="ticker" placeholder="GP" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Company Name</mat-label>
              <input matInput formControlName="company_name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Exchange</mat-label>
              <mat-select formControlName="exchange">
                <mat-option value="DSE">DSE</mat-option>
                <mat-option value="CSE">CSE</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Sector</mat-label>
              <input matInput formControlName="sector" placeholder="Telecom, Bank, ..." />
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Quantity</mat-label>
              <input matInput formControlName="quantity" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Buy Price (BDT)</mat-label>
              <input matInput formControlName="buy_price" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Current Price (BDT)</mat-label>
              <input matInput formControlName="current_price" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Buy Date</mat-label>
              <input matInput formControlName="buy_date" type="date" />
            </mat-form-field>
          </div>
          <div class="form-btns">
            @if (editingId) {
              <button type="button" class="action-btn secondary" (click)="cancelEdit()">Cancel</button>
            }
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon> {{ editingId ? 'Update' : 'Add' }}
            </button>
          </div>
        </form>
      </div>

      @if (investments.length) {
        <div class="holdings-table">
          <div class="thead">
            <span>Ticker</span><span>Company</span><span>Qty</span><span>Buy</span><span>Current</span><span>Market Value</span><span>P/L</span><span>Actions</span>
          </div>
          @for (i of investments; track i.id) {
            <div class="trow">
              <span class="ticker">
                <strong>{{ i.ticker }}</strong>
                <small>{{ i.exchange }}</small>
              </span>
              <span>{{ i.company_name }}<br/><small class="sector">{{ i.sector || '—' }}</small></span>
              <span>{{ i.quantity | number:'1.0-2' }}</span>
              <span>{{ i.buy_price | bdt }}</span>
              <span class="price-cell">
                {{ i.current_price | bdt }}
                <button mat-icon-button class="price-btn" (click)="quickPriceUpdate(i)" title="Update price"><mat-icon>edit</mat-icon></button>
              </span>
              <span class="market">{{ i.market_value | bdt }}</span>
              <span class="pl" [class.up]="i.gain_loss >= 0" [class.down]="i.gain_loss < 0">
                {{ i.gain_loss | bdt }}<br/>
                <small>{{ i.gain_loss_percent | number:'1.1-2' }}%</small>
              </span>
              <span class="actions">
                <button mat-icon-button (click)="edit(i)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="del(i.id)"><mat-icon>delete_outline</mat-icon></button>
              </span>
            </div>
          }
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>trending_up</mat-icon>
          <p>No holdings yet. Add your first DSE/CSE stock above.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1300px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }

    .summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-item { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; text-align: center;
      &.up { border-color: rgba(52,211,153,0.3); }
      &.down { border-color: rgba(251,113,133,0.3); }
    }
    .s-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .s-value { display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); &.gold { color: var(--accent-gold); } }
    .summary-item.up .s-value { color: var(--accent-emerald); }
    .summary-item.down .s-value { color: var(--accent-rose); }

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

    .holdings-table { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .thead, .trow { display: grid; grid-template-columns: 90px 1.5fr 80px 100px 130px 130px 120px 100px; align-items: center; padding: 14px 18px; }
    .thead { background: rgba(255,255,255,0.03); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; }
    .trow { border-top: 1px solid var(--border-subtle); font-size: 14px; color: var(--text-primary);
      &:hover { background: rgba(255,255,255,0.02); }
    }
    .ticker strong { display: block; font-weight: 700; color: var(--accent-gold); }
    .ticker small { font-size: 10px; color: var(--text-muted); }
    .sector { color: var(--text-muted); font-size: 11px; }
    .market { font-weight: 700; color: var(--accent-gold); }
    .pl { font-weight: 600;
      &.up { color: var(--accent-emerald); }
      &.down { color: var(--accent-rose); }
      small { font-size: 11px; opacity: 0.85; }
    }
    .price-cell { display: flex; align-items: center; gap: 4px; }
    .price-btn mat-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; }
    .actions { display: flex; gap: 0; }

    .empty-card { display: flex; flex-direction: column; align-items: center; padding: 60px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }

    @media (max-width: 1100px) { .summary-strip { grid-template-columns: repeat(2, 1fr); } .thead, .trow { grid-template-columns: 1fr; gap: 4px; } .thead { display: none; } }
  `],
})
export class InvestmentListComponent implements OnInit {
  investments: any[] = [];
  summary: any = null;
  form: FormGroup;
  editingId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      ticker: ['', Validators.required],
      company_name: ['', Validators.required],
      exchange: ['DSE', Validators.required],
      sector: [''],
      quantity: [null, [Validators.required, Validators.min(0.0001)]],
      buy_price: [null, [Validators.required, Validators.min(0.01)]],
      current_price: [null, [Validators.required, Validators.min(0.01)]],
      buy_date: [new Date().toISOString().slice(0, 10), Validators.required],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getInvestments().subscribe(rows => { this.investments = rows; });
    this.api.getInvestmentSummary().subscribe(s => { this.summary = s; });
  }

  submit() {
    if (this.form.invalid) return;
    const obs = this.editingId
      ? this.api.updateInvestment(this.editingId, this.form.value)
      : this.api.createInvestment(this.form.value);
    obs.subscribe({
      next: () => { this.snackBar.open(this.editingId ? 'Updated' : 'Added', 'OK', { duration: 2500 }); this.cancelEdit(); this.load(); },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'OK', { duration: 3000 }),
    });
  }

  edit(i: any) {
    this.editingId = i.id;
    this.form.patchValue({
      ticker: i.ticker, company_name: i.company_name, exchange: i.exchange, sector: i.sector,
      quantity: i.quantity, buy_price: i.buy_price, current_price: i.current_price,
      buy_date: (i.buy_date || '').slice(0, 10),
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ exchange: 'DSE', buy_date: new Date().toISOString().slice(0, 10) });
  }

  del(id: number) {
    if (confirm('Delete this holding?')) {
      this.api.deleteInvestment(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  quickPriceUpdate(i: any) {
    const newPrice = prompt(`Update current price for ${i.ticker} (current: ${i.current_price})`, String(i.current_price));
    if (!newPrice) return;
    const price = Number(newPrice);
    if (Number.isNaN(price) || price <= 0) return;
    this.api.updateInvestmentPrice(i.id, price).subscribe(() => { this.snackBar.open('Price updated', 'OK', { duration: 2000 }); this.load(); });
  }
}
