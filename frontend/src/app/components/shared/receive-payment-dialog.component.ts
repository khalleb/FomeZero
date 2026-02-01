import { Component, Inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PaymentMethod } from '../../models/payment-method.model';

export interface PaymentEntry {
  paymentMethodId: string;
  amount: number;
}

export interface ReceivePaymentDialogData {
  customerName: string;
  totalAmount: number;
  paymentMethods: PaymentMethod[];
}

export interface ReceivePaymentDialogResult {
  confirmed: boolean;
  paidAt?: Date;
  payments: PaymentEntry[];
}

@Component({
  selector: 'app-receive-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Receber Pagamento</h2>
    <mat-dialog-content>
      <p><strong>Cliente:</strong> {{ data.customerName }}</p>
      <p><strong>Valor Total:</strong> {{ data.totalAmount | currency:'BRL' }}</p>

      <mat-form-field class="full-width">
        <mat-label>Data do Pagamento</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="paidAt">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <div class="payments-section">
        <div class="payments-header">
          <strong>Formas de Pagamento</strong>
          <button mat-icon-button color="primary" (click)="addPayment()"
                  [disabled]="payments().length >= activePaymentMethods.length">
            <mat-icon>add</mat-icon>
          </button>
        </div>

        @for (payment of payments(); track $index) {
          <div class="payment-row">
            <mat-form-field class="payment-method-field">
              <mat-label>Forma</mat-label>
              <mat-select [(ngModel)]="payment.paymentMethodId">
                @for (method of activePaymentMethods; track method.id) {
                  <mat-option [value]="method.id">{{ method.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field class="payment-amount-field">
              <mat-label>Valor</mat-label>
              <input matInput type="number" [(ngModel)]="payment.amount" min="0" step="0.01">
              <span matTextPrefix>R$&nbsp;</span>
            </mat-form-field>

            @if (payments().length > 1) {
              <button mat-icon-button color="warn" (click)="removePayment($index)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </div>
        }
      </div>

      <div class="summary" [class.error]="difference() !== 0">
        <div class="summary-row">
          <span>Total Informado:</span>
          <span>{{ paymentsTotal() | currency:'BRL' }}</span>
        </div>
        @if (difference() !== 0) {
          <div class="summary-row difference">
            <span>Diferença:</span>
            <span>{{ difference() | currency:'BRL' }}</span>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="confirm()"
              [disabled]="!isValid()">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    mat-dialog-content p {
      margin: 8px 0;
    }
    .full-width {
      width: 100%;
      margin-top: 16px;
    }
    .payments-section {
      margin-top: 24px;
    }
    .payments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .payment-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .payment-method-field {
      flex: 1;
    }
    .payment-amount-field {
      width: 140px;
    }
    .summary {
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .summary.error {
      background-color: #ffebee;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
    }
    .summary-row.difference {
      color: #f44336;
      font-weight: 500;
    }
  `]
})
export class ReceivePaymentDialogComponent {
  paidAt: Date = new Date();
  readonly payments = signal<PaymentEntry[]>([]);
  readonly activePaymentMethods: PaymentMethod[];

  readonly paymentsTotal = computed(() => {
    return this.payments().reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  readonly difference = computed(() => {
    return Math.round((this.data.totalAmount - this.paymentsTotal()) * 100) / 100;
  });

  constructor(
    public dialogRef: MatDialogRef<ReceivePaymentDialogComponent, ReceivePaymentDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ReceivePaymentDialogData
  ) {
    this.activePaymentMethods = data.paymentMethods.filter(pm => pm.active);

    if (this.activePaymentMethods.length > 0) {
      this.payments.set([{
        paymentMethodId: this.activePaymentMethods[0].id!,
        amount: data.totalAmount
      }]);
    }
  }

  addPayment(): void {
    const availableMethod = this.activePaymentMethods.find(
      m => !this.payments().some(p => p.paymentMethodId === m.id)
    );

    if (availableMethod) {
      this.payments.update(payments => [
        ...payments,
        { paymentMethodId: availableMethod.id!, amount: 0 }
      ]);
    }
  }

  removePayment(index: number): void {
    this.payments.update(payments => payments.filter((_, i) => i !== index));
  }

  isValid(): boolean {
    const payments = this.payments();
    if (payments.length === 0) return false;
    if (this.difference() !== 0) return false;
    return payments.every(p => p.paymentMethodId && p.amount > 0);
  }

  cancel(): void {
    this.dialogRef.close({ confirmed: false, payments: [] });
  }

  confirm(): void {
    this.dialogRef.close({
      confirmed: true,
      paidAt: this.paidAt,
      payments: this.payments()
    });
  }
}
