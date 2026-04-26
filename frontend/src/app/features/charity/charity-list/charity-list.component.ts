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
  selector: 'app-charity-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule, BdtPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Sadaqah & Zakat</h1>
          <p class="subtitle">Track your zakat, sadaqah, fitra, qurbani and lillah</p>
        </div>
        <div class="year-nav">
          <button class="nav-btn" (click)="prevYear()"><mat-icon>chevron_left</mat-icon></button>
          <span class="year-label">{{ year }}</span>
          <button class="nav-btn" (click)="nextYear()"><mat-icon>chevron_right</mat-icon></button>
        </div>
      </div>

      @if (summary) {
        <div class="summary-strip">
          <div class="summary-item highlight">
            <span class="s-label">Total Given ({{ year }})</span>
            <span class="s-value gold">{{ summary.totalGiven | bdt }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Zakat Paid</span>
            <span class="s-value">{{ summary.zakatPaid | bdt }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Sadaqah</span>
            <span class="s-value">{{ summary.sadaqahPaid | bdt }}</span>
          </div>
          <div class="summary-item">
            <span class="s-label">Records</span>
            <span class="s-value">{{ summary.recordCount }}</span>
          </div>
        </div>

        @if (summary.fitra || summary.qurbani || summary.lillah || summary.other) {
          <div class="breakdown-strip">
            @if (summary.fitra) { <div class="bd-item"><span>Fitra</span><strong>{{ summary.fitra | bdt }}</strong></div> }
            @if (summary.qurbani) { <div class="bd-item"><span>Qurbani</span><strong>{{ summary.qurbani | bdt }}</strong></div> }
            @if (summary.lillah) { <div class="bd-item"><span>Lillah</span><strong>{{ summary.lillah | bdt }}</strong></div> }
            @if (summary.other) { <div class="bd-item"><span>Other</span><strong>{{ summary.other | bdt }}</strong></div> }
          </div>
        }
      }

      <div class="form-card">
        <h3 class="section-title">{{ editingId ? 'Edit Donation' : 'Log Donation' }}</h3>
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
              <mat-label>Amount (BDT)</mat-label>
              <input matInput formControlName="amount" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                @for (c of categories; track c) {
                  <mat-option [value]="c">{{ format(c) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput formControlName="date" type="date" />
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Recipient</mat-label>
              <input matInput formControlName="recipient" placeholder="Madrasa, mosque, person, organization, ..." />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Hijri Year (optional)</mat-label>
              <input matInput formControlName="hijri_year" placeholder="1447" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="notes">
              <mat-label>Notes</mat-label>
              <input matInput formControlName="notes" />
            </mat-form-field>
          </div>
          <div class="form-btns">
            @if (editingId) { <button type="button" class="action-btn secondary" (click)="cancelEdit()">Cancel</button> }
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>{{ editingId ? 'save' : 'add' }}</mat-icon> {{ editingId ? 'Update' : 'Log' }}
            </button>
          </div>
        </form>
      </div>

      @if (records.length) {
        <div class="records-list">
          @for (r of records; track r.id) {
            <div class="record-row">
              <div class="rec-left">
                <div class="rec-type" [class]="'rt-' + r.type">{{ format(r.type) }}</div>
                <div class="rec-info">
                  <div class="rec-recipient">{{ r.recipient || 'Anonymous recipient' }}</div>
                  <div class="rec-meta">{{ format(r.category) }} · {{ r.date | date:'mediumDate' }}</div>
                </div>
              </div>
              <div class="rec-right">
                <span class="rec-amount">{{ r.amount | bdt }}</span>
                <button mat-icon-button (click)="edit(r)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="del(r.id)"><mat-icon>delete_outline</mat-icon></button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>volunteer_activism</mat-icon>
          <p>No donations logged for {{ year }}. May Allah accept your future giving.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .year-nav { display: flex; align-items: center; gap: 12px; }
    .nav-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 6px; cursor: pointer; color: var(--text-secondary);
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .year-label { font-size: 16px; font-weight: 700; color: var(--accent-gold); min-width: 60px; text-align: center; }

    .summary-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .summary-item { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; text-align: center;
      &.highlight { border-color: rgba(212,168,83,0.3); }
    }
    .s-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .s-value { display: block; font-size: 20px; font-weight: 700; color: var(--text-primary); &.gold { color: var(--accent-gold); } }

    .breakdown-strip { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .bd-item { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 14px; font-size: 13px;
      span { color: var(--text-muted); margin-right: 8px; }
      strong { color: var(--text-primary); }
    }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
    mat-form-field { flex: 1; min-width: 160px; &.notes { flex: 2; } }
    .form-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &.secondary { background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border-subtle); }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .records-list { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .record-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--border-subtle);
      &:first-child { border-top: none; }
      &:hover { background: rgba(255,255,255,0.02); }
    }
    .rec-left { display: flex; align-items: center; gap: 16px; }
    .rec-type { padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      &.rt-zakat { background: rgba(212,168,83,0.15); color: var(--accent-gold); }
      &.rt-sadaqah { background: rgba(52,211,153,0.15); color: var(--accent-emerald); }
      &.rt-fitra { background: rgba(167,139,250,0.15); color: #a78bfa; }
      &.rt-qurbani { background: rgba(251,113,133,0.15); color: var(--accent-rose); }
      &.rt-lillah { background: rgba(96,165,250,0.15); color: #60a5fa; }
      &.rt-other { background: rgba(255,255,255,0.08); color: var(--text-secondary); }
    }
    .rec-recipient { color: var(--text-primary); font-weight: 600; font-size: 14px; }
    .rec-meta { color: var(--text-muted); font-size: 12px; margin-top: 2px; }
    .rec-right { display: flex; align-items: center; gap: 12px; }
    .rec-amount { font-weight: 700; color: var(--accent-gold); font-size: 15px; }

    .empty-card { display: flex; flex-direction: column; align-items: center; padding: 60px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }

    @media (max-width: 900px) { .summary-strip { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class CharityListComponent implements OnInit {
  records: any[] = [];
  summary: any = null;
  form: FormGroup;
  editingId: number | null = null;
  year = new Date().getFullYear();
  types = ['zakat', 'sadaqah', 'fitra', 'qurbani', 'lillah', 'other'];
  categories = ['cash', 'food', 'clothing', 'medical', 'education', 'orphan', 'mosque', 'other'];

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      type: ['sadaqah', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      category: ['cash', Validators.required],
      date: [new Date().toISOString().slice(0, 10), Validators.required],
      recipient: [''],
      hijri_year: [''],
      notes: [''],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getCharity(this.year).subscribe(rows => { this.records = rows; });
    this.api.getCharitySummary(this.year).subscribe(s => { this.summary = s; });
  }

  submit() {
    if (this.form.invalid) return;
    const payload = { ...this.form.value };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    const obs = this.editingId ? this.api.updateCharity(this.editingId, payload) : this.api.createCharity(payload);
    obs.subscribe({
      next: () => { this.snackBar.open(this.editingId ? 'Updated' : 'Logged', 'OK', { duration: 2500 }); this.cancelEdit(); this.load(); },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'OK', { duration: 3000 }),
    });
  }

  edit(r: any) {
    this.editingId = r.id;
    this.form.patchValue({
      type: r.type, amount: r.amount, category: r.category,
      date: (r.date || '').slice(0, 10),
      recipient: r.recipient || '', hijri_year: r.hijri_year || '', notes: r.notes || '',
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ type: 'sadaqah', category: 'cash', date: new Date().toISOString().slice(0, 10) });
  }

  del(id: number) {
    if (confirm('Delete this record?')) {
      this.api.deleteCharity(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  prevYear() { this.year--; this.load(); }
  nextYear() { this.year++; this.load(); }

  format(t: string): string { return t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''; }
}
