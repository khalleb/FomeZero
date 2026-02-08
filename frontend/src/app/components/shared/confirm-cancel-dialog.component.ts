import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SaleItem } from '../../models/sale.model';

export interface ConfirmCancelDialogData {
  customerName: string;
  saleDate: Date;
  totalAmount: number;
  paidAmount: number;
  items: SaleItem[];
}

@Component({
  selector: 'app-confirm-cancel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Cancelar Venda</h2>
    <mat-dialog-content>
      <div class="sale-details">
        <p><strong>Cliente:</strong> {{ data.customerName }}</p>
        <p><strong>Data:</strong> {{ data.saleDate | date:'dd/MM/yyyy HH:mm' }}</p>
        <p><strong>Valor Total:</strong> {{ data.totalAmount | currency:'BRL' }}</p>
      </div>

      <div class="items-list">
        <p><strong>Itens:</strong></p>
        <ul>
          @for (item of data.items; track item) {
            <li>{{ item.quantity }}x {{ item.snack?.name || 'Item' }} - {{ item.totalAmount | currency:'BRL' }}</li>
          }
        </ul>
      </div>

      @if (data.paidAmount > 0) {
        <div class="credit-warning">
          <mat-icon>info</mat-icon>
          <span>
            O valor já pago de <strong>{{ data.paidAmount | currency:'BRL' }}</strong> será devolvido como crédito ao cliente.
          </span>
        </div>
      }

      <p class="confirm-text">Tem certeza que deseja cancelar esta venda?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Voltar</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Confirmar Cancelamento</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .sale-details {
      margin-bottom: 16px;
    }
    .sale-details p {
      margin: 4px 0;
    }
    .items-list {
      margin-bottom: 16px;
    }
    .items-list ul {
      margin: 4px 0;
      padding-left: 20px;
    }
    .items-list li {
      margin: 2px 0;
      color: #ccc;
    }
    .credit-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: rgba(255, 152, 0, 0.15);
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .credit-warning mat-icon {
      color: #ff9800;
    }
    .confirm-text {
      font-weight: 500;
      margin-top: 8px;
    }
  `]
})
export class ConfirmCancelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmCancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmCancelDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
