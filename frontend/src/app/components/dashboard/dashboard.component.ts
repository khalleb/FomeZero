import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { SaleService } from '../../services/sale.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { DashboardStats, PeriodType, SnackRankingItem, CustomerDebtRanking, CustomerBuyerRanking, OldDebtAlert, HighRiskCustomerAlert } from '../../models/dashboard.model';
import { Sale } from '../../models/sale.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { ReceivePaymentDialogComponent, ReceivePaymentDialogResult } from '../shared/receive-payment-dialog.component';
import { SaleFormComponent } from '../sales/sale-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    BaseChartDirective
  ],
  template: `
    <!-- Header com filtro de período e botão nova venda -->
    <div class="dashboard-header">
      <div class="period-filter">
        <mat-button-toggle-group [(ngModel)]="selectedPeriod" (change)="onPeriodChange()">
          <mat-button-toggle value="today">Hoje</mat-button-toggle>
          <mat-button-toggle value="week">Esta Semana</mat-button-toggle>
          <mat-button-toggle value="month">Este Mês</mat-button-toggle>
          <mat-button-toggle value="custom">Personalizado</mat-button-toggle>
        </mat-button-toggle-group>

        @if (selectedPeriod === 'custom') {
          <div class="custom-date-range">
            <mat-form-field>
              <mat-label>Data Inicial</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="customStartDate" (dateChange)="onCustomDateChange()">
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Data Final</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="customEndDate" (dateChange)="onCustomDateChange()">
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>
        }
      </div>

      <button mat-raised-button color="primary" class="new-sale-btn" (click)="openNewSale()">
        <mat-icon>add_shopping_cart</mat-icon>
        Nova Venda
      </button>
    </div>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @else {
      <!-- Cards Financeiros -->
      <div class="financial-cards">
        <mat-card class="financial-card collected">
          <mat-card-content>
            <div class="financial-icon">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="financial-info">
              <p class="label">Total Arrecadado</p>
              <h2>{{ stats()?.totalCollectedInPeriod | currency:'BRL' }}</h2>
              <p class="sub-label">{{ stats()?.totalSalesInPeriod }} venda(s) no período</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="financial-card receivable">
          <mat-card-content>
            <div class="financial-icon">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="financial-info">
              <p class="label">Total a Receber</p>
              <h2>{{ stats()?.totalReceivable | currency:'BRL' }}</h2>
              <p class="sub-label">{{ stats()?.unpaidSalesCount }} venda(s) em aberto</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="financial-card ticket">
          <mat-card-content>
            <div class="financial-icon">
              <mat-icon>confirmation_number</mat-icon>
            </div>
            <div class="financial-info">
              <p class="label">Ticket Médio</p>
              <h2>{{ stats()?.averageTicketInPeriod | currency:'BRL' }}</h2>
              <p class="sub-label">no período selecionado</p>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Gráfico de Evolução Mensal -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>show_chart</mat-icon>
            Evolução Mensal
            <span class="growth-badge" [class.positive]="(stats()?.monthOverMonthGrowth || 0) >= 0" [class.negative]="(stats()?.monthOverMonthGrowth || 0) < 0">
              {{ (stats()?.monthOverMonthGrowth || 0) >= 0 ? '+' : '' }}{{ stats()?.monthOverMonthGrowth | number:'1.1-1' }}%
            </span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (stats()?.monthlyHistory && stats()!.monthlyHistory.length > 0) {
            <div class="chart-container">
              <canvas baseChart
                [data]="chartData()"
                [options]="chartOptions"
                [type]="chartType">
              </canvas>
            </div>
          } @else {
            <p class="empty-message">Sem dados para exibir</p>
          }
        </mat-card-content>
      </mat-card>

      <!-- Cards de Contadores -->
      <div class="counter-cards">
        <mat-card class="counter-card clickable" (click)="navigateTo('/customers')">
          <mat-card-content>
            <div class="counter-icon customers">
              <mat-icon>people</mat-icon>
            </div>
            <div class="counter-info">
              <h3>{{ stats()?.totalCustomers }}</h3>
              <p>Clientes</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="counter-card clickable" (click)="navigateTo('/accounts-receivable')">
          <mat-card-content>
            <div class="counter-icon receivable-link">
              <mat-icon>request_quote</mat-icon>
            </div>
            <div class="counter-info">
              <h3>{{ stats()?.unpaidSalesCount }}</h3>
              <p>Contas a Receber</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Rankings Section -->
      <div class="rankings-section">
        <!-- Top Selling Snacks -->
        <mat-card class="ranking-card snacks">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>emoji_events</mat-icon>
              Top 5 Lanches Mais Vendidos
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (stats()?.topSellingSnacks && stats()!.topSellingSnacks.length > 0) {
              <div class="ranking-list">
                @for (snack of stats()!.topSellingSnacks; track snack.snackName; let i = $index) {
                  <div class="ranking-item" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                    <div class="rank-badge">{{ i + 1 }}</div>
                    <div class="rank-info">
                      <span class="rank-name">{{ snack.snackName }}</span>
                      <span class="rank-details">{{ snack.quantitySold }} vendidos - {{ snack.totalRevenue | currency:'BRL' }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-message">Nenhuma venda no período</p>
            }
          </mat-card-content>
        </mat-card>

        <!-- Top Buyers -->
        <mat-card class="ranking-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>star</mat-icon>
              Melhores Clientes
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="top-buyers">
              @if (stats()?.topBuyerByQuantity) {
                <div class="buyer-highlight">
                  <div class="buyer-label">Mais Compras</div>
                  <div class="buyer-name">{{ stats()!.topBuyerByQuantity!.customerName }}</div>
                  <div class="buyer-stat">{{ stats()!.topBuyerByQuantity!.purchaseCount }} compras</div>
                </div>
              }
              @if (stats()?.topBuyerByValue) {
                <div class="buyer-highlight">
                  <div class="buyer-label">Maior Valor</div>
                  <div class="buyer-name">{{ stats()!.topBuyerByValue!.customerName }}</div>
                  <div class="buyer-stat">{{ stats()!.topBuyerByValue!.totalSpent | currency:'BRL' }}</div>
                </div>
              }
              @if (!stats()?.topBuyerByQuantity && !stats()?.topBuyerByValue) {
                <p class="empty-message">Nenhuma venda no período</p>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Top Debtors -->
        <mat-card class="ranking-card debtors">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>account_balance_wallet</mat-icon>
              Maiores Devedores
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (stats()?.topDebtors && stats()!.topDebtors.length > 0) {
              <div class="ranking-list">
                @for (debtor of stats()!.topDebtors; track debtor.customerId; let i = $index) {
                  <div class="ranking-item debtor">
                    <div class="rank-badge">{{ i + 1 }}</div>
                    <div class="rank-info">
                      <span class="rank-name">{{ debtor.customerName }}</span>
                      <span class="rank-details">{{ debtor.totalDebt | currency:'BRL' }} ({{ debtor.unpaidSalesCount }} vendas)</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-message">Nenhum devedor</p>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Alerts Section -->
      @if ((stats()?.oldDebts && stats()!.oldDebts.length > 0) || (stats()?.highRiskCustomers && stats()!.highRiskCustomers.length > 0)) {
        <div class="alerts-section">
          <!-- Old Debts Alert -->
          @if (stats()?.oldDebts && stats()!.oldDebts.length > 0) {
            <mat-card class="alert-card old-debts">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>schedule</mat-icon>
                  Débitos Antigos (+30 dias)
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="alert-list">
                  @for (debt of stats()!.oldDebts; track debt.saleId) {
                    <div class="alert-item">
                      <div class="alert-info">
                        <span class="alert-name">{{ debt.customerName }}</span>
                        <span class="alert-details">{{ debt.daysOverdue }} dias - {{ debt.amount | currency:'BRL' }}</span>
                      </div>
                      <span class="alert-date">{{ debt.saleDate | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- High Risk Customers Alert -->
          @if (stats()?.highRiskCustomers && stats()!.highRiskCustomers.length > 0) {
            <mat-card class="alert-card high-risk">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>warning</mat-icon>
                  Clientes de Alto Risco
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="alert-list">
                  @for (customer of stats()!.highRiskCustomers; track customer.customerId) {
                    <div class="alert-item">
                      <div class="alert-info">
                        <span class="alert-name">{{ customer.customerName }}</span>
                        <span class="alert-reason">{{ customer.riskReason }}</span>
                      </div>
                      <span class="alert-value">{{ customer.totalDebt | currency:'BRL' }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      <!-- Tabela de Vendas em Aberto -->
      <mat-card class="unpaid-sales-card">
        <mat-card-header>
          <mat-card-title>Vendas em Aberto (Fiado)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loadingUnpaid()) {
            <div class="loading-container small">
              <mat-spinner diameter="30"></mat-spinner>
            </div>
          } @else if (unpaidSales().length > 0) {
            <div class="table-responsive">
              <table mat-table [dataSource]="unpaidSales()" class="full-width">
                <ng-container matColumnDef="customer">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.customer?.name }}</td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Data</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.saleDate | date:'dd/MM/yyyy' }}</td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let sale">{{ sale.totalAmount | currency:'BRL' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Ações</th>
                  <td mat-cell *matCellDef="let sale">
                    <button mat-button color="primary" (click)="markAsPaid(sale)">
                      Receber
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          } @else {
            <p class="empty-message">Nenhuma venda em aberto</p>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }
    .period-filter {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .custom-date-range {
      display: flex;
      gap: 12px;
    }
    .custom-date-range mat-form-field {
      width: 150px;
    }
    .new-sale-btn {
      height: 48px;
      font-size: 16px;
      padding: 0 24px;
    }
    .new-sale-btn mat-icon {
      margin-right: 8px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    .loading-container.small {
      padding: 30px;
    }

    /* Financial Cards */
    .financial-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .financial-card {
      background-color: #1e1e1e !important;
    }
    .financial-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .financial-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
    }
    .financial-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .collected .financial-icon { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
    .receivable .financial-icon { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
    .ticket .financial-icon { background: rgba(0, 188, 212, 0.2); color: #00bcd4; }
    /* Chart Card */
    .chart-card {
      background-color: #1e1e1e !important;
      margin-bottom: 24px;
    }
    .chart-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }
    .chart-card mat-card-title mat-icon {
      color: #00bcd4;
    }
    .growth-badge {
      margin-left: auto;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
    }
    .growth-badge.positive {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }
    .growth-badge.negative {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }
    .chart-container {
      height: 250px;
      position: relative;
    }
    .financial-info {
      flex: 1;
    }
    .financial-info .label {
      margin: 0;
      font-size: 12px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .financial-info h2 {
      margin: 4px 0;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
    }
    .financial-info h2.positive { color: #4caf50; }
    .financial-info h2.negative { color: #f44336; }
    .financial-info .sub-label {
      margin: 0;
      font-size: 11px;
      color: #888;
    }

    /* Counter Cards */
    .counter-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .counter-card {
      background-color: #1e1e1e !important;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .counter-card.clickable {
      cursor: pointer;
    }
    .counter-card.clickable:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0, 188, 212, 0.3);
    }
    .counter-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .counter-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .counter-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }
    .counter-icon.customers { background: #00bcd4; }
    .counter-icon.snacks { background: #ff9800; }
    .counter-icon.receivable-link { background: #9c27b0; }
    .counter-info h3 {
      margin: 0;
      font-size: 20px;
      color: #fff;
    }
    .counter-info p {
      margin: 0;
      font-size: 12px;
      color: #aaa;
    }

    /* Rankings Section */
    .rankings-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .ranking-card {
      background-color: #1e1e1e !important;
    }
    .ranking-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }
    .ranking-card mat-card-title mat-icon {
      color: #ffd700;
    }
    .ranking-card.debtors mat-card-title mat-icon {
      color: #ff9800;
    }
    .ranking-card.snacks mat-card-title mat-icon {
      color: #ff9800;
    }
    .ranking-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ranking-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .rank-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      background: #555;
      color: white;
    }
    .ranking-item.gold .rank-badge { background: linear-gradient(135deg, #ffd700, #f0b000); }
    .ranking-item.silver .rank-badge { background: linear-gradient(135deg, #c0c0c0, #a0a0a0); }
    .ranking-item.bronze .rank-badge { background: linear-gradient(135deg, #cd7f32, #a0522d); }
    .ranking-item.debtor .rank-badge { background: #ff9800; }
    .rank-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .rank-name {
      font-weight: 500;
      color: #fff;
    }
    .rank-details {
      font-size: 12px;
      color: #aaa;
    }

    /* Top Buyers */
    .top-buyers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .buyer-highlight {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .buyer-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .buyer-name {
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 4px;
    }
    .buyer-stat {
      font-size: 14px;
      color: #4caf50;
      font-weight: 500;
    }

    /* Alerts Section */
    .alerts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .alert-card {
      background-color: #1e1e1e !important;
    }
    .alert-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }
    .alert-card.old-debts mat-card-title mat-icon {
      color: #ff9800;
    }
    .alert-card.high-risk mat-card-title mat-icon {
      color: #f44336;
    }
    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 8px;
      border-left: 3px solid #ff9800;
    }
    .alert-card.high-risk .alert-item {
      background: rgba(244, 67, 54, 0.1);
      border-left-color: #f44336;
    }
    .alert-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .alert-name {
      font-weight: 500;
      color: #fff;
    }
    .alert-details, .alert-reason {
      font-size: 12px;
      color: #aaa;
    }
    .alert-reason {
      color: #f44336;
    }
    .alert-date, .alert-value {
      font-size: 12px;
      color: #888;
      white-space: nowrap;
    }
    .alert-value {
      font-weight: 500;
      color: #f44336;
    }

    /* Unpaid Sales Card */
    .unpaid-sales-card {
      margin-top: 8px;
    }
    .empty-message {
      text-align: center;
      color: #aaa;
      padding: 20px;
    }
    .table-responsive {
      overflow-x: auto;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
      }
      .new-sale-btn {
        width: 100%;
      }
      .custom-date-range {
        flex-direction: column;
      }
      .custom-date-range mat-form-field {
        width: 100%;
      }
      .financial-cards {
        grid-template-columns: 1fr;
      }
      .counter-cards {
        grid-template-columns: 1fr 1fr;
      }
      .rankings-section {
        grid-template-columns: 1fr;
      }
      .alerts-section {
        grid-template-columns: 1fr;
      }
      .top-buyers {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  selectedPeriod: PeriodType = 'month';
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;

  readonly loading = signal(false);
  readonly loadingUnpaid = signal(false);
  readonly stats = signal<DashboardStats | null>(null);
  readonly unpaidSales = signal<Sale[]>([]);
  readonly paymentMethods = signal<PaymentMethod[]>([]);

  readonly displayedColumns = ['customer', 'date', 'total', 'actions'];

  // Configurações do gráfico
  readonly chartType: ChartType = 'line';

  readonly chartData = computed(() => {
    const monthlyHistory = this.stats()?.monthlyHistory || [];
    return {
      labels: monthlyHistory.map(m => m.month),
      datasets: [
        {
          data: monthlyHistory.map(m => m.total),
          label: 'Faturamento',
          fill: true,
          tension: 0.4,
          borderColor: '#00bcd4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          pointBackgroundColor: '#00bcd4',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#00bcd4'
        }
      ]
    };
  });

  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#aaa',
        borderColor: '#333',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa',
          callback: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`
        }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private saleService: SaleService,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    const { startDate, endDate } = this.getDateRange();

    this.dashboardService.getStats(startDate, endDate).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });

    this.paymentMethodService.getAll(1, 1000).subscribe({
      next: (result) => this.paymentMethods.set(result.items)
    });

    this.loadUnpaidSales();
  }

  loadUnpaidSales(): void {
    this.loadingUnpaid.set(true);
    this.saleService.getUnpaid(1, 100).subscribe({
      next: (result) => {
        const sorted = result.items.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        this.unpaidSales.set(sorted.slice(0, 10)); // Mostrar apenas as 10 maiores
        this.loadingUnpaid.set(false);
      },
      error: () => {
        this.loadingUnpaid.set(false);
      }
    });
  }

  getDateRange(): { startDate?: Date; endDate?: Date } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (this.selectedPeriod) {
      case 'today':
        return { startDate: today, endDate: today };

      case 'week':
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        return { startDate: startOfWeek, endDate: today };

      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: startOfMonth, endDate: today };

      case 'custom':
        return {
          startDate: this.customStartDate || undefined,
          endDate: this.customEndDate || undefined
        };

      default:
        return {};
    }
  }

  onPeriodChange(): void {
    if (this.selectedPeriod !== 'custom') {
      this.loadData();
    }
  }

  onCustomDateChange(): void {
    if (this.customStartDate && this.customEndDate) {
      this.loadData();
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  openNewSale(): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
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
          this.loadData();
        });
      }
    });
  }
}
