import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule, BdtPipe, DecimalPipe, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Financial Goals</h1>
          <p class="subtitle">Set targets and track your progress</p>
        </div>
      </div>

      <!-- Add Goal -->
      <div class="form-card">
        <h3 class="section-title">Add New Goal</h3>
        <form [formGroup]="form" (ngSubmit)="addGoal()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Goal Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g., Son's University Fund" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="retirement">Retirement</mat-option>
                <mat-option value="education">Education</mat-option>
                <mat-option value="housing">Housing</mat-option>
                <mat-option value="emergency">Emergency Fund</mat-option>
                <mat-option value="hajj">Hajj</mat-option>
                <mat-option value="marriage">Marriage</mat-option>
                <mat-option value="vehicle">Vehicle</mat-option>
                <mat-option value="travel">Travel</mat-option>
                <mat-option value="business">Business</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Target Amount (BDT)</mat-label>
              <input matInput formControlName="target_amount" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Current Amount (BDT)</mat-label>
              <input matInput formControlName="current_amount" type="number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Target Date</mat-label>
              <input matInput formControlName="target_date" type="date" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="high">High</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="low">Low</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <button type="submit" class="action-btn primary" [disabled]="form.invalid">
            <mat-icon>add</mat-icon> Add Goal
          </button>
        </form>
      </div>

      <!-- Goals Grid -->
      @if (goals.length) {
        <div class="goals-grid">
          @for (goal of goals; track goal.id) {
            <div class="goal-card">
              <div class="goal-header">
                <span class="goal-name">{{ goal.name }}</span>
                <button mat-icon-button (click)="deleteGoal(goal.id)">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
              <div class="goal-meta">
                <span class="goal-cat">{{ goal.category }}</span>
                <span class="goal-priority" [class]="goal.priority">{{ goal.priority }}</span>
              </div>
              <div class="goal-progress">
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="getProgress(goal)"></div>
                </div>
                <span class="progress-pct">{{ getProgress(goal) | number:'1.0-0' }}%</span>
              </div>
              <div class="goal-amounts">
                {{ goal.current_amount | bdt }} <span class="of">of</span> {{ goal.target_amount | bdt }}
              </div>
              @if (goal.target_date) {
                <div class="goal-date">
                  <mat-icon>event</mat-icon> {{ goal.target_date | date:'MMM d, y' }}
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>flag</mat-icon>
          <p>No financial goals yet. Set your first goal above!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    mat-form-field { flex: 1; min-width: 180px; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .goals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .goal-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      padding: 20px; transition: all var(--transition-base);
      &:hover { border-color: var(--border-light); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    }
    .goal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .goal-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .goal-meta { display: flex; gap: 8px; margin-bottom: 16px; }
    .goal-cat {
      font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.05);
      padding: 2px 8px; border-radius: 4px; text-transform: capitalize;
    }
    .goal-priority {
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
      &.high { color: var(--accent-rose); background: rgba(251,113,133,0.1); }
      &.medium { color: var(--accent-amber); background: rgba(251,191,36,0.1); }
      &.low { color: var(--accent-emerald); background: rgba(52,211,153,0.1); }
    }
    .goal-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .progress-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-gold-dark), var(--accent-gold)); border-radius: 3px; transition: width 0.5s ease; }
    .progress-pct { font-size: 13px; font-weight: 600; color: var(--accent-gold); min-width: 36px; text-align: right; }
    .goal-amounts { font-size: 13px; color: var(--text-secondary); .of { color: var(--text-muted); } }
    .goal-date {
      display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-top: 10px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .empty-card {
      display: flex; flex-direction: column; align-items: center; padding: 60px;
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }

    @media (max-width: 900px) { .goals-grid { grid-template-columns: 1fr; } }
  `],
})
export class GoalListComponent implements OnInit {
  goals: any[] = [];
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required], category: ['other', Validators.required],
      target_amount: [null, [Validators.required, Validators.min(1)]],
      current_amount: [0], target_date: [''], priority: ['medium'],
    });
  }

  ngOnInit() { this.load(); }
  load() { this.api.getGoals().subscribe(result => this.goals = result.data); }

  addGoal() {
    if (this.form.invalid) return;
    this.api.createGoal(this.form.value).subscribe(() => {
      this.form.reset({ category: 'other', current_amount: 0, priority: 'medium' });
      this.load();
    });
  }

  deleteGoal(id: number) {
    if (confirm('Delete this goal?')) {
      this.api.deleteGoal(id).subscribe(() => this.load());
    }
  }

  getProgress(goal: any): number {
    if (!goal.target_amount) return 0;
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  }
}
