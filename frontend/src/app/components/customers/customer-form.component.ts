import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-form',
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
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Novo' }} Cliente</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>WhatsApp</mat-label>
          <input
            matInput
            formControlName="whatsApp"
            placeholder="62999999999"
            (keypress)="onlyNumbers($event)"
          >
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
export class CustomerFormComponent {
  form: FormGroup;
  readonly saving = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CustomerFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Customer | null,
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      whatsApp: [data?.whatsApp || ''],
      active: [data?.active ?? true]
    });
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);

    const customer: Customer = {
      ...this.form.value
    };

    const request = this.data
      ? this.customerService.update(this.data.id!, customer)
      : this.customerService.create(customer);

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
