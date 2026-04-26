import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-family-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatCheckboxModule, DatePipe, TitleCasePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Family Members</h1>
          <p class="subtitle">Manage nominees and dependents</p>
        </div>
      </div>

      <!-- Add form -->
      <div class="form-card">
        <h3 class="section-title">Add Family Member</h3>
        <form [formGroup]="form" (ngSubmit)="addMember()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Relationship</mat-label>
              <mat-select formControlName="relationship">
                <mat-option value="spouse">Spouse</mat-option>
                <mat-option value="son">Son</mat-option>
                <mat-option value="daughter">Daughter</mat-option>
                <mat-option value="father">Father</mat-option>
                <mat-option value="mother">Mother</mat-option>
                <mat-option value="brother">Brother</mat-option>
                <mat-option value="sister">Sister</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="male">Male</mat-option>
                <mat-option value="female">Female</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row-actions">
            <mat-form-field appearance="outline" class="dob-field">
              <mat-label>Date of Birth</mat-label>
              <input matInput formControlName="date_of_birth" type="date" />
            </mat-form-field>
            <mat-checkbox formControlName="is_nominee">Nominee</mat-checkbox>
            <button type="submit" class="action-btn primary" [disabled]="form.invalid">
              <mat-icon>add</mat-icon> Add
            </button>
          </div>
        </form>
      </div>

      <!-- Members list -->
      <div class="table-card">
        <table mat-table [dataSource]="members">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let m"><span class="cell-name">{{ m.name }}</span></td>
          </ng-container>
          <ng-container matColumnDef="relationship">
            <th mat-header-cell *matHeaderCellDef>Relationship</th>
            <td mat-cell *matCellDef="let m"><span class="type-pill">{{ m.relationship | titlecase }}</span></td>
          </ng-container>
          <ng-container matColumnDef="date_of_birth">
            <th mat-header-cell *matHeaderCellDef>Date of Birth</th>
            <td mat-cell *matCellDef="let m">{{ m.date_of_birth ? (m.date_of_birth | date:'MMM d, y') : '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="is_minor">
            <th mat-header-cell *matHeaderCellDef>Minor</th>
            <td mat-cell *matCellDef="let m">
              <span class="badge" [class.yes]="m.is_minor">{{ m.is_minor ? 'Yes' : 'No' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="is_nominee">
            <th mat-header-cell *matHeaderCellDef>Nominee</th>
            <td mat-cell *matCellDef="let m">
              <span class="badge" [class.yes]="m.is_nominee">{{ m.is_nominee ? 'Yes' : '—' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let m">
              <button mat-icon-button (click)="delete(m.id)"><mat-icon>delete_outline</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }
    .form-card {
      background: var(--bg-card); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg); padding: 24px; margin-bottom: 16px;
    }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    mat-form-field { flex: 1; min-width: 180px; }
    .form-row-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .dob-field { flex: 0 0 200px; }
    .table-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .cell-name { font-weight: 600; }
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .badge { font-size: 12px; color: var(--text-muted); &.yes { color: var(--accent-emerald); } }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
      border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      border: none; cursor: pointer; transition: all var(--transition-base);
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &:disabled { opacity: 0.5; cursor: default; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
})
export class FamilyListComponent implements OnInit {
  members: any[] = [];
  columns = ['name', 'relationship', 'date_of_birth', 'is_minor', 'is_nominee', 'actions'];
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      gender: ['male'],
      date_of_birth: [''],
      is_nominee: [false],
    });
  }

  ngOnInit() { this.load(); }
  load() { this.api.getFamily().subscribe(m => this.members = m); }

  addMember() {
    if (this.form.invalid) return;
    this.api.createFamilyMember(this.form.value).subscribe(() => {
      this.form.reset({ gender: 'male', is_nominee: false });
      this.load();
    });
  }

  delete(id: number) {
    if (confirm('Remove this family member?')) {
      this.api.deleteFamilyMember(id).subscribe(() => this.load());
    }
  }
}
