import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SnackService } from '../../services/snack.service';
import { Snack } from '../../models/snack.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-snack-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Novo' }} Lanche</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Preço</mat-label>
          <input matInput type="number" formControlName="price" step="0.01">
          <span matTextPrefix>R$&nbsp;</span>
        </mat-form-field>

        <div class="toggle-field">
          <mat-slide-toggle formControlName="active">Ativo</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()" [disabled]="saving()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Salvar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .toggle-field {
      margin: 16px 0;
    }
  `]
})
export class SnackFormComponent {
  form: FormGroup;
  readonly saving = signal(false);

  constructor(
    public dialogRef: MatDialogRef<SnackFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Snack | null,
    private fb: FormBuilder,
    private snackService: SnackService
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      price: [data?.price || 0, [Validators.required, Validators.min(0.01)]],
      active: [data?.active ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);

    const snack: Snack = {
      ...this.form.value
    };

    const request = this.data
      ? this.snackService.update(this.data.id!, snack)
      : this.snackService.create(snack);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        // Handle error if needed
      }
    });
  }
}
