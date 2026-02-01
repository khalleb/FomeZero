import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-payment-method-form',
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
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nova' }} Forma de Pagamento</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name">
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
export class PaymentMethodFormComponent {
  form: FormGroup;
  readonly saving = signal(false);

  constructor(
    public dialogRef: MatDialogRef<PaymentMethodFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentMethod | null,
    private fb: FormBuilder,
    private paymentMethodService: PaymentMethodService
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      active: [data?.active ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);

    const paymentMethod: PaymentMethod = {
      ...this.form.value
    };

    const request = this.data
      ? this.paymentMethodService.update(this.data.id!, paymentMethod)
      : this.paymentMethodService.create(paymentMethod);

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
