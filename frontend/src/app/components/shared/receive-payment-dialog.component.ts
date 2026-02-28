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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PaymentMethod } from '../../models/payment-method.model';

export interface PaymentEntry {
  paymentMethodId: string;
  amount: number;
}

export interface ReceivePaymentDialogData {
  customerName: string;
  totalAmount: number;
  originalAmount?: number;
  paymentMethods: PaymentMethod[];
  customerId?: string;
  customerCredit?: number;
  allowPartialPayment?: boolean;
}

export interface ReceivePaymentDialogResult {
  confirmed: boolean;
  paidAt?: Date;
  payments: PaymentEntry[];
  useCredit?: boolean;
  creditUsed?: number;
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
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Receber Pagamento</h2>
    <mat-dialog-content>
      <p><strong>Cliente:</strong> {{ data.customerName }}</p>
      @if (data.originalAmount) {
        <p><strong>Valor da venda:</strong> {{ data.originalAmount | currency:'BRL' }}</p>
        <p><strong>Restante a pagar:</strong> {{ data.totalAmount | currency:'BRL' }}</p>
      } @else {
        <p><strong>Valor Total:</strong> {{ data.totalAmount | currency:'BRL' }}</p>
      }

      @if (data.customerCredit && data.customerCredit > 0) {
        <div class="credit-section">
          <mat-checkbox [(ngModel)]="useCredit" (change)="onUseCreditChange()">
            Usar crédito disponível: {{ data.customerCredit | currency:'BRL' }}
          </mat-checkbox>
          @if (useCredit) {
            <p class="credit-info">
              Crédito a utilizar: <strong>{{ creditToUse() | currency:'BRL' }}</strong>
              <br>
              Restante a pagar: <strong>{{ amountAfterCredit() | currency:'BRL' }}</strong>
            </p>
          }
        </div>
      }

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

      <div class="summary" [class.error]="difference() !== 0 && !data.allowPartialPayment">
        <div class="summary-row">
          <span>Total Informado:</span>
          <span>{{ paymentsTotal() | currency:'BRL' }}</span>
        </div>
        @if (difference() !== 0) {
          <div class="summary-row" [class.difference]="!data.allowPartialPayment" [class.info]="data.allowPartialPayment">
            <span>{{ difference() > 0 ? 'Faltam:' : 'Sobram:' }}</span>
            <span>{{ (difference() > 0 ? difference() : -difference()) | currency:'BRL' }}</span>
          </div>
          @if (data.allowPartialPayment && difference() < 0) {
            <div class="summary-row info">
              <span>O valor excedente será adicionado como crédito do cliente.</span>
            </div>
          }
          @if (data.allowPartialPayment && difference() > 0) {
            <div class="summary-row info">
              <span>As vendas mais antigas serão quitadas (FIFO).</span>
            </div>
          }
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
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    .summary.error {
      background-color: rgba(244, 67, 54, 0.1);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
      color: #fff;
    }
    .summary-row.difference {
      color: #f44336;
      font-weight: 500;
    }
    .summary-row.info {
      color: #00bcd4;
      font-size: 12px;
    }
    .credit-section {
      margin: 16px 0;
      padding: 12px;
      background-color: rgba(76, 175, 80, 0.1);
      border-radius: 4px;
    }
    .credit-info {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #4caf50;
    }
  `]
})
export class ReceivePaymentDialogComponent {
  paidAt: Date = new Date();
  useCredit: boolean = false;
  readonly payments = signal<PaymentEntry[]>([]);
  readonly activePaymentMethods: PaymentMethod[];

  readonly creditToUse = computed(() => {
    if (!this.useCredit || !this.data.customerCredit) return 0;
    return Math.min(this.data.customerCredit, this.data.totalAmount);
  });

  readonly amountAfterCredit = computed(() => {
    return Math.round((this.data.totalAmount - this.creditToUse()) * 100) / 100;
  });

  readonly paymentsTotal = computed(() => {
    return this.payments().reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  readonly difference = computed(() => {
    const expectedAmount = this.amountAfterCredit();
    return Math.round((expectedAmount - this.paymentsTotal()) * 100) / 100;
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

  onUseCreditChange(): void {
    if (this.activePaymentMethods.length > 0) {
      this.payments.set([{
        paymentMethodId: this.activePaymentMethods[0].id!,
        amount: this.useCredit ? this.amountAfterCredit() : this.data.totalAmount
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
    // Se permite pagamento parcial, só valida se tem valor > 0
    if (this.data.allowPartialPayment) {
      return payments.every(p => p.paymentMethodId && p.amount > 0);
    }
    // Caso contrário, valida se o valor é exato
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
      payments: this.payments(),
      useCredit: this.useCredit,
      creditUsed: this.creditToUse()
    });
  }
}
