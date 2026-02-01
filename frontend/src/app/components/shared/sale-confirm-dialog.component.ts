import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

export interface SaleConfirmDialogItem {
  snackName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleConfirmDialogData {
  customerName: string;
  saleDate: Date;
  items: SaleConfirmDialogItem[];
  calculatedTotal: number;
  finalTotal: number;
  isPaid: boolean;
}

@Component({
  selector: 'app-sale-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <h2 mat-dialog-title>Confirmar Venda</h2>
    <mat-dialog-content>
      <p><strong>Data:</strong> {{ data.saleDate | date:'dd/MM/yyyy' }}</p>
      <p><strong>Cliente:</strong> {{ data.customerName }}</p>

      <mat-divider></mat-divider>

      <div class="items-list">
        <h4>Itens</h4>
        @for (item of data.items; track $index) {
          <div class="item-row">
            <span class="item-name">{{ item.snackName }}</span>
            <span class="item-details">
              {{ item.quantity }}x {{ item.unitPrice | currency:'BRL' }}
            </span>
            <span class="item-subtotal">{{ item.subtotal | currency:'BRL' }}</span>
          </div>
        }
      </div>

      <mat-divider></mat-divider>

      <div class="total-section">
        @if (hasDiscount) {
          <div class="calculated-total">
            <span>Subtotal:</span>
            <span class="strikethrough">{{ data.calculatedTotal | currency:'BRL' }}</span>
          </div>
          <div class="discount-badge">
            Desconto aplicado: {{ discountPercentage | number:'1.0-1' }}%
          </div>
        }
        <div class="final-total">
          <strong>Total:</strong>
          <strong>{{ data.finalTotal | currency:'BRL' }}</strong>
        </div>
      </div>

      <div class="status-section">
        <span>Status: </span>
        <mat-chip [class.paid]="data.isPaid" [class.unpaid]="!data.isPaid">
          {{ data.isPaid ? 'Pago' : 'Fiado' }}
        </mat-chip>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="confirm()">Confirmar Venda</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 350px;
    }
    mat-divider {
      margin: 16px 0;
    }
    .items-list h4 {
      margin: 0 0 12px 0;
      color: #aaa;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      gap: 16px;
    }
    .item-name {
      flex: 1;
    }
    .item-details {
      color: #aaa;
    }
    .item-subtotal {
      min-width: 80px;
      text-align: right;
    }
    .total-section {
      margin: 16px 0;
    }
    .calculated-total {
      display: flex;
      justify-content: space-between;
      color: #aaa;
      margin-bottom: 8px;
    }
    .strikethrough {
      text-decoration: line-through;
    }
    .discount-badge {
      background-color: #4caf50;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .final-total {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
    }
    .status-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
    }
    .paid {
      background-color: #4caf50 !important;
      color: white !important;
    }
    .unpaid {
      background-color: #f44336 !important;
      color: white !important;
    }
  `]
})
export class SaleConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SaleConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: SaleConfirmDialogData
  ) {}

  get hasDiscount(): boolean {
    return this.data.finalTotal < this.data.calculatedTotal;
  }

  get discountPercentage(): number {
    if (this.data.calculatedTotal === 0) return 0;
    return ((this.data.calculatedTotal - this.data.finalTotal) / this.data.calculatedTotal) * 100;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
