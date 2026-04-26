import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { TitleCasePipe } from '@angular/common';
import { BdtPipe } from '../../../shared/pipes/bdt.pipe';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-liability-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule, BdtPipe, TitleCasePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Liabilities</h1>
          <p class="subtitle">Track loans, debts and obligations</p>
        </div>
      </div>

      <div class="table-card">
        <table mat-table [dataSource]="liabilities">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let l"><span class="cell-name">{{ l.name }}</span></td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let l"><span class="type-pill">{{ l.type?.replace('_', ' ') | titlecase }}</span></td>
          </ng-container>
          <ng-container matColumnDef="institution">
            <th mat-header-cell *matHeaderCellDef>Institution</th>
            <td mat-cell *matCellDef="let l">{{ l.institution || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="outstanding_amount">
            <th mat-header-cell *matHeaderCellDef>Outstanding</th>
            <td mat-cell *matCellDef="let l" class="value-neg">{{ l.outstanding_amount | bdt }}</td>
          </ng-container>
          <ng-container matColumnDef="emi_amount">
            <th mat-header-cell *matHeaderCellDef>Monthly EMI</th>
            <td mat-cell *matCellDef="let l">{{ l.emi_amount | bdt }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let l">
              <button mat-icon-button (click)="delete(l.id)"><mat-icon>delete_outline</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        @if (!liabilities.length) {
          <div class="empty-state">
            <mat-icon>credit_card</mat-icon>
            <p>No liabilities recorded</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .table-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .cell-name { font-weight: 600; }
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .value-neg { font-weight: 600; color: var(--accent-rose) !important; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center; padding: 48px;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); }
    }
  `],
})
export class LiabilityListComponent implements OnInit {
  liabilities: any[] = [];
  columns = ['name', 'type', 'institution', 'outstanding_amount', 'emi_amount', 'actions'];

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getLiabilities().subscribe(result => this.liabilities = result.data); }

  delete(id: number) {
    if (confirm('Delete this liability?')) {
      this.api.deleteLiability(id).subscribe(() => this.load());
    }
  }
}
