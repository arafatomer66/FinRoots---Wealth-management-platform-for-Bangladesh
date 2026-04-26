import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BdtPipe } from '../../shared/pipes/bdt.pipe';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, MatChipsModule, MatIconModule, MatMenuModule, MatButtonModule, RouterLink, BdtPipe, DatePipe, DecimalPipe],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Welcome back, {{ getFirstName() }}</h1>
          <p class="subtitle">Here's your financial overview</p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary" [matMenuTriggerFor]="exportMenu">
            <mat-icon>download</mat-icon> Export
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportCsv('full-report')"><mat-icon>summarize</mat-icon> Full Report</button>
            <button mat-menu-item (click)="exportCsv('assets')"><mat-icon>account_balance_wallet</mat-icon> Assets</button>
            <button mat-menu-item (click)="exportCsv('liabilities')"><mat-icon>credit_card</mat-icon> Liabilities</button>
            <button mat-menu-item (click)="exportCsv('income')"><mat-icon>trending_up</mat-icon> Income</button>
            <button mat-menu-item (click)="exportCsv('expenses')"><mat-icon>receipt</mat-icon> Expenses</button>
          </mat-menu>
          <a class="action-btn primary" routerLink="/assets/new">
            <mat-icon>add</mat-icon> Add Asset
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card net-worth">
            <div class="stat-icon-wrap nw"><mat-icon>account_balance_wallet</mat-icon></div>
            <div class="stat-body">
              <span class="stat-label">Net Worth</span>
              <span class="stat-value">{{ data?.netWorth?.netWorth | bdt }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap assets"><mat-icon>trending_up</mat-icon></div>
            <div class="stat-body">
              <span class="stat-label">Total Assets</span>
              <span class="stat-value positive">{{ data?.netWorth?.totalAssets | bdt }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap liab"><mat-icon>trending_down</mat-icon></div>
            <div class="stat-body">
              <span class="stat-label">Total Liabilities</span>
              <span class="stat-value negative">{{ data?.netWorth?.totalLiabilities | bdt }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap cash"><mat-icon>swap_vert</mat-icon></div>
            <div class="stat-body">
              <span class="stat-label">Monthly Cashflow</span>
              <span class="stat-value" [class.positive]="data?.cashflow?.netCashflow > 0" [class.negative]="data?.cashflow?.netCashflow < 0">
                {{ data?.cashflow?.netCashflow | bdt }}
              </span>
              <span class="stat-detail">
                In: {{ data?.cashflow?.monthlyIncome | bdt }} &middot; Out: {{ data?.cashflow?.monthlyExpenses | bdt }}
              </span>
            </div>
          </div>
        </div>

        <!-- Health Score + Income vs Expense Chart -->
        <div class="content-grid">
          <!-- Health Score -->
          @if (data?.healthScore) {
            <div class="panel health-panel">
              <div class="panel-header">
                <h3>Financial Health Score</h3>
                <span class="grade grade-{{ data.healthScore.grade }}">{{ data.healthScore.grade }}</span>
              </div>
              <div class="panel-body">
                <div class="score-display">
                  <div class="score-ring">
                    <svg viewBox="0 0 100 100" class="score-svg">
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" stroke-width="8" fill="none" />
                      <circle cx="50" cy="50" r="42" [attr.stroke]="getScoreColor(data.healthScore.score)" stroke-width="8" fill="none"
                              stroke-linecap="round" transform="rotate(-90 50 50)"
                              [attr.stroke-dasharray]="263.89"
                              [attr.stroke-dashoffset]="263.89 - (data.healthScore.score / 100 * 263.89)" />
                    </svg>
                    <div class="score-num">
                      <span class="score-value">{{ data.healthScore.score }}</span>
                      <span class="score-max">/100</span>
                    </div>
                  </div>
                  <div class="score-breakdown">
                    <div class="bd-row">
                      <span class="bd-label">Savings Rate</span>
                      <div class="bd-bar"><div class="bd-fill" [style.width.%]="(data.healthScore.breakdown.savingsRate.score / 25) * 100"></div></div>
                      <span class="bd-val">{{ data.healthScore.breakdown.savingsRate.value }}%</span>
                    </div>
                    <div class="bd-row">
                      <span class="bd-label">Debt Ratio</span>
                      <div class="bd-bar"><div class="bd-fill" [style.width.%]="(data.healthScore.breakdown.debtRatio.score / 25) * 100"></div></div>
                      <span class="bd-val">{{ data.healthScore.breakdown.debtRatio.value }}%</span>
                    </div>
                    <div class="bd-row">
                      <span class="bd-label">Emergency Fund</span>
                      <div class="bd-bar"><div class="bd-fill" [style.width.%]="(data.healthScore.breakdown.emergencyFund.score / 25) * 100"></div></div>
                      <span class="bd-val">{{ data.healthScore.breakdown.emergencyFund.months }}mo</span>
                    </div>
                    <div class="bd-row">
                      <span class="bd-label">Goal Progress</span>
                      <div class="bd-bar"><div class="bd-fill" [style.width.%]="(data.healthScore.breakdown.goalProgress.score / 25) * 100"></div></div>
                      <span class="bd-val">{{ data.healthScore.breakdown.goalProgress.activeGoals }} goals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Income vs Expense Chart -->
          <div class="panel">
            <div class="panel-header">
              <h3>Income vs Expense (6 months)</h3>
              <a routerLink="/income" class="panel-link">View all</a>
            </div>
            <div class="panel-body chart-body">
              <canvas #incomeExpenseChart width="500" height="240"></canvas>
              <div class="chart-legend">
                <span class="legend-item"><span class="dot income"></span> Income</span>
                <span class="legend-item"><span class="dot expense"></span> Expenses</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Allocation chart + Maturities -->
        <div class="content-grid">
          <!-- Asset Allocation Donut -->
          <div class="panel">
            <div class="panel-header">
              <h3>Asset Allocation</h3>
              <a routerLink="/assets" class="panel-link">View all</a>
            </div>
            <div class="panel-body">
              @if (data?.allocation?.length) {
                <div class="alloc-with-chart">
                  <canvas #allocationChart width="160" height="160"></canvas>
                  <div class="alloc-legend">
                    @for (item of data.allocation; track item.asset_type; let idx = $index) {
                      <div class="alloc-row">
                        <div class="alloc-left">
                          <span class="alloc-dot" [style.background]="getChartColor(idx)"></span>
                          <span class="alloc-badge">{{ formatAssetType(item.asset_type) }}</span>
                        </div>
                        <span class="alloc-value">{{ item.total_value | bdt }}</span>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <div class="empty-state">
                  <mat-icon>account_balance_wallet</mat-icon>
                  <p>No assets yet</p>
                  <a routerLink="/assets/new" class="empty-action">Add your first asset</a>
                </div>
              }
            </div>
          </div>

          <!-- Upcoming Maturities -->
          <div class="panel">
            <div class="panel-header">
              <h3>Upcoming Maturities</h3>
              <span class="badge-accent">90 days</span>
            </div>
            <div class="panel-body">
              @if (data?.maturities?.length) {
                @for (item of data.maturities; track item.id) {
                  <div class="maturity-row">
                    <div class="maturity-left">
                      <strong>{{ item.name }}</strong>
                      <span class="maturity-type">{{ formatAssetType(item.asset_type) }}</span>
                    </div>
                    <div class="maturity-right">
                      <span class="maturity-value">{{ item.current_value | bdt }}</span>
                      <span class="maturity-date">{{ item.maturity_date | date:'MMM d, y' }}</span>
                    </div>
                  </div>
                }
              } @else {
                <div class="empty-state">
                  <mat-icon>event</mat-icon>
                  <p>No upcoming maturities</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Goals -->
        <div class="panel full-width">
          <div class="panel-header">
            <h3>Financial Goals</h3>
            <a routerLink="/goals" class="panel-link">Manage</a>
          </div>
          <div class="panel-body">
            @if (data?.goals?.length) {
              <div class="goals-grid">
                @for (goal of data.goals; track goal.id) {
                  <div class="goal-card">
                    <div class="goal-top">
                      <span class="goal-name">{{ goal.name }}</span>
                      <span class="goal-cat">{{ goal.category }}</span>
                    </div>
                    <div class="goal-progress">
                      <div class="progress-track">
                        <div class="progress-fill" [style.width.%]="getGoalProgress(goal)"></div>
                      </div>
                      <span class="progress-pct">{{ getGoalProgress(goal) | number:'1.0-0' }}%</span>
                    </div>
                    <div class="goal-amounts">
                      {{ goal.current_amount | bdt }} <span class="of">of</span> {{ goal.target_amount | bdt }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>flag</mat-icon>
                <p>No goals set</p>
                <a routerLink="/goals" class="empty-action">Create your first goal</a>
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <a class="qa-card" routerLink="/tax">
            <div class="qa-icon tax"><mat-icon>receipt_long</mat-icon></div>
            <span>Calculate Tax</span>
          </a>
          <a class="qa-card" routerLink="/zakat">
            <div class="qa-icon zakat"><mat-icon>volunteer_activism</mat-icon></div>
            <span>Calculate Zakat</span>
          </a>
          <a class="qa-card" routerLink="/budgets">
            <div class="qa-icon budget"><mat-icon>pie_chart</mat-icon></div>
            <span>Budgets</span>
          </a>
          <a class="qa-card" routerLink="/documents">
            <div class="qa-icon docs"><mat-icon>folder</mat-icon></div>
            <span>Documents</span>
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;
      h1 { font-size: 28px; margin-bottom: 4px; }
      .subtitle { color: var(--text-secondary); font-size: 14px; }
    }
    .header-actions { display: flex; gap: 10px; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
      border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      transition: all var(--transition-base); cursor: pointer; text-decoration: none;
      border: none;
      &.primary {
        background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold));
        color: #0a0f1e; box-shadow: var(--shadow-gold);
        &:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(212,168,83,0.3); }
      }
      &.secondary {
        background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border-subtle);
        &:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
      }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .loading { display: flex; justify-content: center; padding: 80px; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); padding: 20px; display: flex; align-items: flex-start; gap: 16px;
      transition: all var(--transition-base);
      &:hover { border-color: var(--border-light); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    }
    .stat-card.net-worth { border-color: var(--border-gold); background: linear-gradient(135deg, rgba(212,168,83,0.06) 0%, var(--bg-card) 100%); }
    .stat-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .stat-icon-wrap.nw { background: rgba(212,168,83,0.12); mat-icon { color: var(--accent-gold); } }
    .stat-icon-wrap.assets { background: rgba(52,211,153,0.12); mat-icon { color: var(--accent-emerald); } }
    .stat-icon-wrap.liab { background: rgba(251,113,133,0.12); mat-icon { color: var(--accent-rose); } }
    .stat-icon-wrap.cash { background: rgba(79,141,247,0.12); mat-icon { color: var(--accent-blue); } }
    .stat-body { display: flex; flex-direction: column; min-width: 0; }
    .stat-label { font-size: 12px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
    .stat-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .stat-detail { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .positive { color: var(--accent-emerald) !important; }
    .negative { color: var(--accent-rose) !important; }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .panel {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); overflow: hidden;
    }
    .panel.full-width { margin-bottom: 20px; }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 24px; border-bottom: 1px solid var(--border-subtle);
      h3 { font-size: 15px; font-weight: 600; margin: 0; }
    }
    .panel-link { font-size: 13px; color: var(--accent-gold); font-weight: 500; }
    .badge-accent {
      font-size: 11px; background: rgba(79,141,247,0.12); color: var(--accent-blue);
      padding: 3px 10px; border-radius: 20px; font-weight: 500;
    }
    .panel-body { padding: 16px 24px; }

    /* ── Health Score ── */
    .grade {
      font-size: 16px; font-weight: 800; padding: 4px 12px; border-radius: 6px;
      &.grade-A { color: var(--accent-emerald); background: rgba(52,211,153,0.12); }
      &.grade-B { color: var(--accent-blue); background: rgba(79,141,247,0.12); }
      &.grade-C { color: var(--accent-amber); background: rgba(251,191,36,0.12); }
      &.grade-D { color: var(--accent-rose); background: rgba(251,113,133,0.12); }
    }
    .score-display { display: flex; align-items: center; gap: 24px; }
    .score-ring { position: relative; width: 130px; height: 130px; flex-shrink: 0; }
    .score-svg { width: 100%; height: 100%; }
    .score-num {
      position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .score-value { font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .score-max { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .score-breakdown { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .bd-row { display: grid; grid-template-columns: 90px 1fr 50px; align-items: center; gap: 10px; }
    .bd-label { font-size: 12px; color: var(--text-secondary); }
    .bd-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
    .bd-fill { height: 100%; background: linear-gradient(90deg, var(--accent-gold-dark), var(--accent-gold)); border-radius: 2px; }
    .bd-val { font-size: 11px; color: var(--text-muted); text-align: right; font-weight: 600; }

    /* ── Chart ── */
    .chart-body { padding: 18px 20px; }
    .chart-body canvas { width: 100% !important; height: auto !important; max-height: 240px; }
    .chart-legend { display: flex; gap: 20px; justify-content: center; margin-top: 12px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
    .dot.income { background: var(--accent-emerald); }
    .dot.expense { background: var(--accent-rose); }

    /* ── Allocation Chart ── */
    .alloc-with-chart { display: flex; gap: 24px; align-items: center; }
    .alloc-legend { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .alloc-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--border-subtle);
      &:last-child { border-bottom: none; }
    }
    .alloc-left { display: flex; align-items: center; gap: 8px; }
    .alloc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .alloc-badge {
      font-size: 12px; font-weight: 500; color: var(--text-secondary);
    }
    .alloc-value { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    /* ── Maturities ── */
    .maturity-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border-subtle);
      &:last-child { border-bottom: none; }
    }
    .maturity-left {
      display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    }
    .maturity-type { font-size: 12px; color: var(--text-muted); }
    .maturity-right { text-align: right; display: flex; flex-direction: column; gap: 2px; }
    .maturity-value { font-size: 14px; font-weight: 600; color: var(--accent-gold); }
    .maturity-date { font-size: 12px; color: var(--text-muted); }

    /* ── Goals ── */
    .goals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .goal-card {
      padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md); transition: all var(--transition-base);
      &:hover { border-color: var(--border-light); background: rgba(255,255,255,0.04); }
    }
    .goal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .goal-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .goal-cat { font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; }
    .goal-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .progress-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-gold-dark), var(--accent-gold)); border-radius: 3px; transition: width 0.5s ease; }
    .progress-pct { font-size: 13px; font-weight: 600; color: var(--accent-gold); min-width: 36px; text-align: right; }
    .goal-amounts { font-size: 12px; color: var(--text-secondary); }
    .of { color: var(--text-muted); }

    /* ── Quick Actions ── */
    .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .qa-card {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 24px 16px; background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-base);
      text-decoration: none; color: var(--text-secondary); font-size: 13px; font-weight: 500;
      &:hover { border-color: var(--border-light); transform: translateY(-2px); box-shadow: var(--shadow-lg); color: var(--text-primary); }
    }
    .qa-icon {
      width: 48px; height: 48px; border-radius: 14px; display: flex;
      align-items: center; justify-content: center;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }
    .qa-icon.tax { background: rgba(251,191,36,0.12); mat-icon { color: var(--accent-amber); } }
    .qa-icon.zakat { background: rgba(52,211,153,0.12); mat-icon { color: var(--accent-emerald); } }
    .qa-icon.budget { background: rgba(167,139,250,0.12); mat-icon { color: var(--accent-purple); } }
    .qa-icon.docs { background: rgba(79,141,247,0.12); mat-icon { color: var(--accent-blue); } }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; padding: 32px 16px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; margin-bottom: 8px; }
    }
    .empty-action { font-size: 13px; color: var(--accent-gold); font-weight: 500; }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
      .goals-grid { grid-template-columns: 1fr; }
      .quick-actions { grid-template-columns: repeat(2, 1fr); }
      .alloc-with-chart { flex-direction: column; }
      .score-display { flex-direction: column; }
    }
  `],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  data: any = null;
  loading = true;
  incomeVsExpense: any[] = [];
  chartColors = ['#d4a853', '#34d399', '#4f8df7', '#a78bfa', '#fbbf24', '#fb7185', '#22d3ee', '#f97316', '#84cc16', '#ec4899', '#94a3b8'];
  @ViewChild('incomeExpenseChart') incomeExpenseCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('allocationChart') allocationCanvas?: ElementRef<HTMLCanvasElement>;

  constructor(public authService: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: (data) => { this.data = data; this.loading = false; setTimeout(() => this.renderCharts(), 100); },
      error: () => { this.loading = false; },
    });

    this.api.getIncomeVsExpense(6).subscribe(data => {
      this.incomeVsExpense = data;
      setTimeout(() => this.renderCharts(), 100);
    });
  }

  ngAfterViewInit() { setTimeout(() => this.renderCharts(), 100); }

  renderCharts() {
    this.renderIncomeExpenseChart();
    this.renderAllocationChart();
  }

  renderIncomeExpenseChart() {
    if (!this.incomeExpenseCanvas || !this.incomeVsExpense.length) return;
    const canvas = this.incomeExpenseCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 240;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...this.incomeVsExpense.flatMap(d => [d.income, d.expenses]), 1);
    const barW = chartW / this.incomeVsExpense.length / 3;

    // Gridlines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      const val = maxVal * (1 - i / 4);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatShort(val), padding.left - 6, y + 3);
    }

    // Bars
    this.incomeVsExpense.forEach((d, idx) => {
      const groupX = padding.left + (chartW / this.incomeVsExpense.length) * idx + (chartW / this.incomeVsExpense.length) / 2;

      const incomeH = (d.income / maxVal) * chartH;
      const expenseH = (d.expenses / maxVal) * chartH;

      const incomeGrad = ctx.createLinearGradient(0, padding.top + chartH - incomeH, 0, padding.top + chartH);
      incomeGrad.addColorStop(0, '#34d399');
      incomeGrad.addColorStop(1, 'rgba(52,211,153,0.4)');
      ctx.fillStyle = incomeGrad;
      ctx.fillRect(groupX - barW - 2, padding.top + chartH - incomeH, barW, incomeH);

      const expenseGrad = ctx.createLinearGradient(0, padding.top + chartH - expenseH, 0, padding.top + chartH);
      expenseGrad.addColorStop(0, '#fb7185');
      expenseGrad.addColorStop(1, 'rgba(251,113,133,0.4)');
      ctx.fillStyle = expenseGrad;
      ctx.fillRect(groupX + 2, padding.top + chartH - expenseH, barW, expenseH);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.month, groupX, h - padding.bottom + 18);
    });
  }

  renderAllocationChart() {
    if (!this.allocationCanvas || !this.data?.allocation?.length) return;
    const canvas = this.allocationCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR - 22;

    const total = this.data.allocation.reduce((s: number, a: any) => s + Number(a.total_value), 0);
    let startAngle = -Math.PI / 2;

    this.data.allocation.forEach((item: any, idx: number) => {
      const slice = (Number(item.total_value) / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
      ctx.arc(cx, cy, innerR, startAngle + slice, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = this.chartColors[idx % this.chartColors.length];
      ctx.fill();
      startAngle += slice;
    });

    // Center text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Total', cx, cy - 6);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Inter';
    ctx.fillText(this.formatShort(total), cx, cy + 10);
  }

  formatShort(n: number): string {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return Math.round(n).toString();
  }

  exportCsv(type: 'assets' | 'income' | 'expenses' | 'liabilities' | 'full-report') {
    this.api.exportCsv(type).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finroots-${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#34d399';
    if (score >= 60) return '#4f8df7';
    if (score >= 40) return '#fbbf24';
    return '#fb7185';
  }

  getChartColor(idx: number): string { return this.chartColors[idx % this.chartColors.length]; }

  getFirstName(): string {
    return this.authService.user()?.name?.split(' ')[0] || '';
  }

  formatAssetType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getGoalProgress(goal: any): number {
    if (!goal.target_amount) return 0;
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  }
}
