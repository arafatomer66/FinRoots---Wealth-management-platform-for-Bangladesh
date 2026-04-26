import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatSnackBarModule, DatePipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Document Vault</h1>
          <p class="subtitle">Securely store important financial documents</p>
        </div>
      </div>

      <!-- Upload -->
      <div class="form-card">
        <h3 class="section-title">Upload Document</h3>
        <form [formGroup]="form" (ngSubmit)="upload()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g., NID Front" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                @for (c of categories; track c) {
                  <mat-option [value]="c">{{ formatType(c) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <div class="file-input-wrap">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
              <div class="file-label" (click)="fileInput.click()">
                <mat-icon>cloud_upload</mat-icon>
                <span>{{ selectedFile ? selectedFile.name : 'Choose file (PDF, JPG, PNG, DOC, XLS — max 10MB)' }}</span>
              </div>
            </div>
            <mat-form-field appearance="outline" class="notes-field">
              <mat-label>Notes</mat-label>
              <input matInput formControlName="notes" />
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button type="submit" class="action-btn primary" [disabled]="form.invalid || !selectedFile || uploading">
              <mat-icon>upload</mat-icon> {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Documents Table -->
      @if (documents.length) {
        <div class="table-card">
          <table mat-table [dataSource]="documents">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let d"><span class="cell-name">{{ d.title }}</span></td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let d"><span class="type-pill">{{ formatType(d.category) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="file_type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let d"><span class="file-type">{{ getFileExt(d.file_type) }}</span></td>
            </ng-container>
            <ng-container matColumnDef="file_size">
              <th mat-header-cell *matHeaderCellDef>Size</th>
              <td mat-cell *matCellDef="let d">{{ formatSize(d.file_size) }}</td>
            </ng-container>
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Uploaded</th>
              <td mat-cell *matCellDef="let d">{{ d.created_at | date:'MMM d, y' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let d">
                <button mat-icon-button (click)="download(d)"><mat-icon>download</mat-icon></button>
                <button mat-icon-button (click)="deleteDoc(d.id)"><mat-icon>delete_outline</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
      } @else {
        <div class="empty-card">
          <mat-icon>folder_open</mat-icon>
          <p>No documents uploaded yet. Upload your first document above!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; h1 { font-size: 28px; margin-bottom: 4px; } .subtitle { color: var(--text-secondary); font-size: 14px; } }

    .form-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    mat-form-field { flex: 1; min-width: 200px; }
    .notes-field { flex: 2; }

    .file-input-wrap { flex: 1; min-width: 280px; }
    .file-input-wrap input[type=file] { display: none; }
    .file-label {
      display: flex; align-items: center; gap: 10px; padding: 14px 16px;
      border: 2px dashed var(--border-subtle); border-radius: var(--radius-sm);
      cursor: pointer; color: var(--text-muted); font-size: 13px;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--accent-gold); color: var(--text-secondary); }
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }

    .form-actions { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle); }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      &.primary { background: linear-gradient(135deg, var(--accent-gold-dark), var(--accent-gold)); color: #0a0f1e; }
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .table-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; }
    .cell-name { font-weight: 600; }
    .type-pill { font-size: 12px; font-weight: 500; color: var(--accent-blue-light); background: rgba(79,141,247,0.1); padding: 4px 10px; border-radius: 6px; }
    .file-type { font-size: 11px; font-weight: 600; color: var(--accent-amber); text-transform: uppercase; background: rgba(251,191,36,0.1); padding: 3px 8px; border-radius: 4px; }

    .empty-card {
      display: flex; flex-direction: column; align-items: center; padding: 60px;
      background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 12px; }
      p { color: var(--text-muted); font-size: 14px; }
    }
  `],
})
export class DocumentListComponent implements OnInit {
  documents: any[] = [];
  form: FormGroup;
  selectedFile: File | null = null;
  uploading = false;
  columns = ['title', 'category', 'file_type', 'file_size', 'created_at', 'actions'];
  categories = ['deed', 'certificate', 'policy', 'tax_return', 'nid', 'tin', 'will', 'other'];

  constructor(private api: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      category: ['other'],
      notes: [''],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getDocuments().subscribe(res => this.documents = res.data);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  upload() {
    if (this.form.invalid || !this.selectedFile) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append('file', this.selectedFile);
    fd.append('title', this.form.value.title);
    fd.append('category', this.form.value.category);
    if (this.form.value.notes) fd.append('notes', this.form.value.notes);

    this.api.uploadDocument(fd).subscribe({
      next: () => {
        this.snackBar.open('Document uploaded', 'OK', { duration: 3000 });
        this.form.reset({ category: 'other' });
        this.selectedFile = null;
        this.uploading = false;
        this.load();
      },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open(err.error?.error || 'Upload failed', 'OK', { duration: 3000 });
      },
    });
  }

  download(doc: any) {
    this.api.downloadDocument(doc.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  deleteDoc(id: number) {
    if (confirm('Delete this document?')) {
      this.api.deleteDocument(id).subscribe(() => { this.snackBar.open('Deleted', 'OK', { duration: 2000 }); this.load(); });
    }
  }

  getFileExt(mime: string): string {
    if (!mime) return '?';
    const map: Record<string, string> = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG', 'application/msword': 'DOC', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX' };
    return map[mime] || mime.split('/').pop()?.toUpperCase() || '?';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatType(t: string): string { return t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''; }
}
