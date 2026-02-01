import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SaleService, PaymentDetail } from '../../services/sale.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { CustomerCreditService } from '../../services/customer-credit.service';
import { Sale, CustomerDebtSummary } from '../../models/sale.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { ReceivePaymentDialogComponent, ReceivePaymentDialogResult } from '../shared/receive-payment-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-accounts-receivable',
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
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="header">
      <h1>Contas a Receber</h1>
    </div>

    <mat-card class="filter-card">
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

        <div class="summary-info">
          <div class="summary-item">
            <span class="label">Clientes com débito:</span>
            <span class="value">{{ totalCount() }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total a receber:</span>
            <span class="value total">{{ totalDebt() | currency:'BRL' }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-content>
        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (debts().length === 0) {
          <p class="empty-message">
            @if (searchTerm) {
              Nenhum cliente encontrado com o termo "{{ searchTerm }}"
            } @else {
              Nenhum cliente com débito pendente
            }
          </p>
        } @else {
          <mat-accordion>
            @for (debt of debts(); track debt.customerId) {
              <mat-expansion-panel (opened)="loadCustomerSales(debt.customerId)" (closed)="clearCustomerSales(debt.customerId)">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <div class="customer-info">
                      <span class="customer-name">{{ debt.customerName }}</span>
                      @if (debt.customerWhatsApp) {
                        <a [href]="'https://wa.me/55' + debt.customerWhatsApp" target="_blank"
                           class="whatsapp-link" (click)="$event.stopPropagation()"
                           matTooltip="Abrir WhatsApp">
                          <mat-icon>phone</mat-icon>
                        </a>
                      }
                    </div>
                  </mat-panel-title>
                  <mat-panel-description>
                    <div class="debt-summary">
                      <mat-chip class="sales-count">{{ debt.unpaidSalesCount }} venda(s)</mat-chip>
                      @if (debt.customerCredit > 0) {
                        <mat-chip class="credit-chip">Crédito: {{ debt.customerCredit | currency:'BRL' }}</mat-chip>
                      }
                      <span class="debt-amount">{{ debt.totalDebt | currency:'BRL' }}</span>
                    </div>
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="customer-sales">
                  @if (loadingCustomerSales()[debt.customerId]) {
                    <div class="loading-sales">
                      <mat-spinner diameter="30"></mat-spinner>
                    </div>
                  } @else {
                    <div class="sales-actions-header">
                      <button mat-raised-button color="primary" (click)="receiveAll(debt)">
                        <mat-icon>payments</mat-icon>
                        Receber Tudo ({{ debt.totalDebt | currency:'BRL' }})
                      </button>
                      <button mat-stroked-button (click)="copyReport(debt)">
                        <mat-icon>content_copy</mat-icon>
                        Copiar Extrato
                      </button>
                      @if (debt.customerWhatsApp) {
                        <button mat-stroked-button color="accent" (click)="sendWhatsApp(debt)">
                          <mat-icon>phone</mat-icon>
                          Enviar WhatsApp
                        </button>
                      }
                    </div>

                    <table mat-table [dataSource]="customerSales()[debt.customerId] || []" class="sales-table">
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Data</th>
                        <td mat-cell *matCellDef="let sale">{{ sale.saleDate | date:'dd/MM/yyyy' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="items">
                        <th mat-header-cell *matHeaderCellDef>Itens</th>
                        <td mat-cell *matCellDef="let sale">
                          <span [matTooltip]="getItemsTooltip(sale)">
                            {{ sale.items?.length || 0 }} item(s)
                          </span>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="total">
                        <th mat-header-cell *matHeaderCellDef>Valor</th>
                        <td mat-cell *matCellDef="let sale">{{ sale.totalAmount | currency:'BRL' }}</td>
                      </ng-container>

                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Ações</th>
                        <td mat-cell *matCellDef="let sale">
                          <button mat-button color="primary" (click)="receiveSingle(sale, debt)">
                            Receber
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="salesColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: salesColumns;"></tr>
                    </table>
                  }
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>

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
    .filter-card {
      margin-bottom: 20px;
    }
    .filter-card mat-card-content {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
    }
    .search-container {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 250px;
    }
    .search-field {
      flex: 1;
    }
    .clear-btn {
      margin-top: -8px;
    }
    .summary-info {
      display: flex;
      gap: 30px;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .summary-item .label {
      font-size: 12px;
      color: #aaa;
    }
    .summary-item .value {
      font-size: 18px;
      font-weight: 500;
    }
    .summary-item .value.total {
      color: #ff5252;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .empty-message {
      text-align: center;
      color: #aaa;
      padding: 40px 20px;
    }
    .customer-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .customer-name {
      font-weight: 500;
    }
    .whatsapp-link {
      color: #25D366;
      display: flex;
      align-items: center;
    }
    .whatsapp-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .debt-summary {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .sales-count {
      background-color: rgba(0, 188, 212, 0.2) !important;
      color: #00bcd4 !important;
    }
    .credit-chip {
      background-color: rgba(76, 175, 80, 0.2) !important;
      color: #4caf50 !important;
    }
    .debt-amount {
      font-weight: 500;
      color: #ff5252;
      font-size: 16px;
    }
    .customer-sales {
      padding: 16px 0;
    }
    .loading-sales {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .sales-actions-header {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .sales-table {
      width: 100%;
    }
    @media (max-width: 768px) {
      .filter-card mat-card-content {
        flex-direction: column;
        align-items: stretch;
      }
      .summary-info {
        justify-content: space-between;
      }
      .debt-summary {
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }
    }
  `]
})
export class AccountsReceivableComponent implements OnInit {
  searchTerm = '';
  pageSize = 10;
  readonly loading = signal(false);
  readonly debts = signal<CustomerDebtSummary[]>([]);
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly customerSales = signal<{ [customerId: string]: Sale[] }>({});
  readonly loadingCustomerSales = signal<{ [customerId: string]: boolean }>({});
  readonly totalCount = signal(0);
  readonly totalDebt = signal(0);
  readonly currentPage = signal(1);
  readonly salesColumns = ['date', 'items', 'total', 'actions'];

  constructor(
    private saleService: SaleService,
    private paymentMethodService: PaymentMethodService,
    private customerCreditService: CustomerCreditService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      debts: this.saleService.getCustomersWithDebts(this.currentPage(), this.pageSize, this.searchTerm || undefined),
      paymentMethods: this.paymentMethodService.getAll(1, 1000)
    }).subscribe({
      next: (result) => {
        this.debts.set(result.debts.items);
        this.totalCount.set(result.debts.totalCount);
        this.totalDebt.set(result.debts.items.reduce((sum, d) => sum + d.totalDebt, 0));
        this.paymentMethods.set(result.paymentMethods.items);
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
    this.loadData();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage.set(1);
    this.loadData();
  }

  loadCustomerSales(customerId: string): void {
    if (this.customerSales()[customerId]) {
      return;
    }

    this.loadingCustomerSales.update(state => ({ ...state, [customerId]: true }));

    this.saleService.getUnpaidByCustomerId(customerId, 1, 1000).subscribe({
      next: (result) => {
        this.customerSales.update(state => ({ ...state, [customerId]: result.items }));
        this.loadingCustomerSales.update(state => ({ ...state, [customerId]: false }));
      },
      error: () => {
        this.loadingCustomerSales.update(state => ({ ...state, [customerId]: false }));
      }
    });
  }

  clearCustomerSales(customerId: string): void {
    this.customerSales.update(state => {
      const newState = { ...state };
      delete newState[customerId];
      return newState;
    });
  }

  getItemsTooltip(sale: Sale): string {
    if (!sale.items || sale.items.length === 0) {
      return 'Sem itens';
    }
    return sale.items.map(item =>
      `${item.quantity}x ${item.snack?.name || 'Item'}`
    ).join('\n');
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  generateReport(debt: CustomerDebtSummary): string {
    const sales = this.customerSales()[debt.customerId] || [];
    const today = new Date().toLocaleDateString('pt-BR');

    let report = `📋 *FOME ZERO - Extrato de Débito*\n\n`;
    report += `👤 Cliente: ${debt.customerName}\n`;
    report += `📅 Data: ${today}\n\n`;
    report += `📝 *Compras em aberto:*\n`;

    for (const sale of sales) {
      const saleDate = new Date(sale.saleDate!).toLocaleDateString('pt-BR');
      const items = sale.items?.map(item =>
        `${item.snack?.name || 'Item'} (${item.quantity}x)`
      ).join(', ') || 'Itens não disponíveis';
      const amount = this.formatCurrency(sale.totalAmount || 0);
      report += `• ${saleDate} - ${items} - ${amount}\n`;
    }

    report += `\n💰 *Total devido: ${this.formatCurrency(debt.totalDebt)}*\n\n`;
    report += `Qualquer dúvida, estamos à disposição!`;

    return report;
  }

  copyReport(debt: CustomerDebtSummary): void {
    const report = this.generateReport(debt);
    navigator.clipboard.writeText(report).then(() => {
      this.snackBar.open('Extrato copiado para a área de transferência!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }).catch(() => {
      this.snackBar.open('Erro ao copiar extrato', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    });
  }

  sendWhatsApp(debt: CustomerDebtSummary): void {
    const report = this.generateReport(debt);
    const phone = debt.customerWhatsApp.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(report);
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  receiveSingle(sale: Sale, debt: CustomerDebtSummary): void {
    const dialogRef = this.dialog.open(ReceivePaymentDialogComponent, {
      width: '500px',
      data: {
        customerName: debt.customerName,
        totalAmount: sale.totalAmount || 0,
        paymentMethods: this.paymentMethods(),
        customerId: debt.customerId,
        customerCredit: debt.customerCredit
      }
    });

    dialogRef.afterClosed().subscribe((result: ReceivePaymentDialogResult) => {
      if (result?.confirmed) {
        // Se usou crédito, registrar o uso
        if (result.useCredit && result.creditUsed && result.creditUsed > 0) {
          this.customerCreditService.useCredit({
            customerId: debt.customerId,
            amount: result.creditUsed,
            description: `Pagamento de venda - ${debt.customerName}`,
            referenceDate: result.paidAt
          }).subscribe();
        }

        this.saleService.markAsPaid(sale.id!, result.paidAt, result.payments).subscribe(() => {
          this.loadData();
          this.customerSales.set({});
        });
      }
    });
  }

  receiveAll(debt: CustomerDebtSummary): void {
    const dialogRef = this.dialog.open(ReceivePaymentDialogComponent, {
      width: '500px',
      data: {
        customerName: debt.customerName,
        totalAmount: debt.totalDebt,
        paymentMethods: this.paymentMethods(),
        customerId: debt.customerId,
        customerCredit: 0, // Desabilitar uso de crédito no FIFO
        allowPartialPayment: true
      }
    });

    dialogRef.afterClosed().subscribe((result: ReceivePaymentDialogResult) => {
      if (result?.confirmed) {
        const sales = this.customerSales()[debt.customerId] || [];
        if (sales.length === 0) {
          return;
        }

        // Calcular valor total recebido (apenas pagamentos)
        const totalPayments = result.payments.reduce((sum, p) => sum + p.amount, 0);
        let remainingAmount = totalPayments;

        // Ordenar vendas por data (mais antiga primeiro - FIFO)
        const sortedSales = [...sales].sort((a, b) =>
          new Date(a.saleDate!).getTime() - new Date(b.saleDate!).getTime()
        );

        // Determinar quais vendas serão pagas completamente
        const salesToPay: Sale[] = [];
        for (const sale of sortedSales) {
          const saleAmount = sale.totalAmount || 0;
          if (remainingAmount >= saleAmount) {
            salesToPay.push(sale);
            remainingAmount -= saleAmount;
          } else {
            break; // Não tem dinheiro suficiente para esta venda
          }
        }

        // Pagar as vendas selecionadas
        if (salesToPay.length === 0) {
          // Nenhuma venda pode ser paga completamente, adicionar tudo como crédito
          this.customerCreditService.addCredit({
            customerId: debt.customerId,
            amount: totalPayments,
            description: `Pagamento antecipado - ${debt.customerName}`,
            referenceDate: result.paidAt
          }).subscribe(() => {
            this.snackBar.open(
              `Valor de ${this.formatCurrency(totalPayments)} adicionado como crédito para ${debt.customerName}`,
              'Fechar',
              { duration: 5000, horizontalPosition: 'center', verticalPosition: 'top' }
            );
            this.loadData();
            this.customerSales.set({});
          });
          return;
        }

        // Se sobrou dinheiro após pagar as vendas completas, adicionar como crédito
        const creditGenerated = remainingAmount > 0.01 ? Math.round(remainingAmount * 100) / 100 : 0;
        if (creditGenerated > 0) {
          this.customerCreditService.addCredit({
            customerId: debt.customerId,
            amount: creditGenerated,
            description: `Troco do pagamento de ${salesToPay.length} venda(s)`,
            referenceDate: result.paidAt
          }).subscribe();
        }

        // Distribuir pagamentos entre as vendas que serão pagas
        const totalToPay = salesToPay.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        const paymentPromises = salesToPay.map((sale, index) => {
          const saleAmount = sale.totalAmount || 0;

          // Distribuir proporcionalmente apenas os pagamentos (não o crédito)
          const salePayments: PaymentDetail[] = result.payments.map(p => ({
            paymentMethodId: p.paymentMethodId,
            amount: Math.round((p.amount * saleAmount / totalToPay) * 100) / 100
          }));

          // Ajustar arredondamento na última venda
          if (index === salesToPay.length - 1) {
            const totalDistributed = salePayments.reduce((sum, p) => sum + p.amount, 0);
            const diff = Math.round((saleAmount - totalDistributed) * 100) / 100;
            if (Math.abs(diff) > 0.01 && salePayments.length > 0) {
              salePayments[0].amount = Math.round((salePayments[0].amount + diff) * 100) / 100;
            }
          }

          return this.saleService.markAsPaid(sale.id!, result.paidAt, salePayments);
        });

        forkJoin(paymentPromises).subscribe(() => {
          let message = `${salesToPay.length} venda(s) quitada(s)`;
          if (creditGenerated > 0) {
            message += `. Crédito gerado: ${this.formatCurrency(creditGenerated)}`;
          }
          this.snackBar.open(message, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadData();
          this.customerSales.set({});
        });
      }
    });
  }
}
