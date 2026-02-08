import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SaleService } from '../../services/sale.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { Sale } from '../../models/sale.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { SaleFormComponent } from './sale-form.component';
import { ReceivePaymentDialogComponent, ReceivePaymentDialogResult } from '../shared/receive-payment-dialog.component';
import { ConfirmCancelDialogComponent } from '../shared/confirm-cancel-dialog.component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="header">
      <h1>Vendas</h1>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon>
        Nova Venda
      </button>
    </div>

    <mat-card>
      <mat-card-content>
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Pesquisar por cliente</mat-label>
            <input matInput [(ngModel)]="searchTerm" (keyup.enter)="onSearch()" placeholder="Digite o nome do cliente...">
            <button mat-icon-button matSuffix (click)="onSearch()">
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>
          @if (searchTerm) {
            <button mat-icon-button (click)="clearSearch()" class="clear-btn">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </div>

        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="sales()" class="full-width">
            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let sale">{{ sale.customer?.name }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let sale">{{ sale.saleDate | date:'dd/MM/yyyy HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>Itens</th>
              <td mat-cell *matCellDef="let sale">{{ sale.items?.length || 0 }} item(s)</td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let sale">{{ sale.totalAmount | currency:'BRL' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let sale">
                @if (sale.active === false) {
                  <mat-chip class="cancelled">Cancelado</mat-chip>
                } @else {
                  <mat-chip [class.paid]="sale.isPaid" [class.unpaid]="!sale.isPaid">
                    {{ sale.isPaid ? 'Pago' : 'Fiado' }}
                  </mat-chip>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let sale">
                @if (sale.active !== false) {
                  @if (!sale.isPaid) {
                    <button mat-button color="primary" (click)="markAsPaid(sale)">
                      Receber
                    </button>
                  }
                  <button mat-button color="warn" (click)="cancelSale(sale)">
                    Cancelar
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          @if (sales().length === 0) {
            <p class="empty-message">Nenhuma venda encontrada</p>
          }

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageIndex]="currentPage() - 1"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h1 {
      color: #00bcd4;
    }
    .search-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .search-field {
      flex: 1;
      max-width: 400px;
    }
    .clear-btn {
      margin-top: -8px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .empty-message {
      text-align: center;
      color: #aaa;
      padding: 20px;
    }
    .paid {
      background-color: #4caf50 !important;
      color: white !important;
    }
    .unpaid {
      background-color: #f44336 !important;
      color: white !important;
    }
    .cancelled {
      background-color: #9e9e9e !important;
      color: white !important;
    }
  `]
})
export class SalesComponent implements OnInit {
  readonly sales = signal<Sale[]>([]);
  readonly loading = signal(false);
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly displayedColumns = ['customer', 'date', 'items', 'total', 'status', 'actions'];

  pageSize = 10;
  searchTerm = '';

  constructor(
    private saleService: SaleService,
    private paymentMethodService: PaymentMethodService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadPaymentMethods();
  }

  loadSales(): void {
    this.loading.set(true);
    this.saleService.getAll(this.currentPage(), this.pageSize, this.searchTerm || undefined).subscribe({
      next: (result) => {
        this.sales.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadPaymentMethods(): void {
    this.paymentMethodService.getAll(1, 1000).subscribe({
      next: (result) => this.paymentMethods.set(result.items)
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadSales();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadSales();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage.set(1);
    this.loadSales();
  }

  openForm(): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSales();
      }
    });
  }

  markAsPaid(sale: Sale): void {
    const dialogRef = this.dialog.open(ReceivePaymentDialogComponent, {
      width: '500px',
      data: {
        customerName: sale.customer?.name || 'Cliente',
        totalAmount: sale.totalAmount || 0,
        paymentMethods: this.paymentMethods()
      }
    });

    dialogRef.afterClosed().subscribe((result: ReceivePaymentDialogResult) => {
      if (result?.confirmed) {
        this.saleService.markAsPaid(sale.id!, result.paidAt, result.payments).subscribe(() => {
          this.loadSales();
        });
      }
    });
  }

  cancelSale(sale: Sale): void {
    const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
      width: '500px',
      data: {
        customerName: sale.customer?.name || 'Cliente',
        saleDate: sale.saleDate,
        totalAmount: sale.totalAmount || 0,
        paidAmount: sale.paidAmount || 0,
        items: sale.items || []
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.saleService.cancel(sale.id!).subscribe({
          next: () => {
            this.snackBar.open('Venda cancelada com sucesso', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadSales();
          },
          error: () => {
            this.snackBar.open('Erro ao cancelar venda', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }
}
