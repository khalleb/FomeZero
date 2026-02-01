import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

export interface PaymentConfirmDialogData {
  customerName: string;
  totalAmount: number;
}

export interface PaymentConfirmDialogResult {
  confirmed: boolean;
  paidAt?: Date;
}

@Component({
  selector: 'app-payment-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>Confirmar Pagamento</h2>
    <mat-dialog-content>
      <p><strong>Cliente:</strong> {{ data.customerName }}</p>
      <p><strong>Valor:</strong> {{ data.totalAmount | currency:'BRL' }}</p>

      <mat-form-field class="full-width">
        <mat-label>Data do Pagamento</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="paidAt">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="confirm()">Confirmar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
    }
    mat-dialog-content p {
      margin: 8px 0;
    }
    .full-width {
      width: 100%;
      margin-top: 16px;
    }
  `]
})
export class PaymentConfirmDialogComponent {
  paidAt: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<PaymentConfirmDialogComponent, PaymentConfirmDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentConfirmDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  confirm(): void {
    this.dialogRef.close({ confirmed: true, paidAt: this.paidAt });
  }
}
