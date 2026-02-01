import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { PaymentMethodFormComponent } from './payment-method-form.component';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="header">
      <h1>Formas de Pagamento</h1>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon>
        Nova Forma de Pagamento
      </button>
    </div>

    <mat-card>
      <mat-card-content>
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Pesquisar por nome</mat-label>
            <input matInput [(ngModel)]="searchTerm" (keyup.enter)="onSearch()" placeholder="Digite o nome...">
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
          <table mat-table [dataSource]="paymentMethods()" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nome</th>
              <td mat-cell *matCellDef="let item">{{ item.name }}</td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Ativo</th>
              <td mat-cell *matCellDef="let item">
                <span [class.active-yes]="item.active" [class.active-no]="!item.active">
                  {{ item.active ? 'SIM' : 'NÃO' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button color="primary" (click)="openForm(item)">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          @if (paymentMethods().length === 0) {
            <p class="empty-message">Nenhuma forma de pagamento encontrada</p>
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
    .active-yes {
      color: #4caf50;
      font-weight: 500;
    }
    .active-no {
      color: #f44336;
      font-weight: 500;
    }
  `]
})
export class PaymentMethodsComponent implements OnInit {
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly loading = signal(false);
  readonly totalCount = signal(0);
  readonly currentPage = signal(1);
  readonly displayedColumns = ['name', 'active', 'actions'];

  pageSize = 10;
  searchTerm = '';

  constructor(
    private paymentMethodService: PaymentMethodService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading.set(true);
    this.paymentMethodService.getAll(this.currentPage(), this.pageSize, this.searchTerm || undefined).subscribe({
      next: (result) => {
        this.paymentMethods.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadPaymentMethods();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadPaymentMethods();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage.set(1);
    this.loadPaymentMethods();
  }

  openForm(paymentMethod?: PaymentMethod): void {
    const dialogRef = this.dialog.open(PaymentMethodFormComponent, {
      width: '400px',
      data: paymentMethod || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPaymentMethods();
      }
    });
  }
}
