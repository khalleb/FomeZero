export interface DashboardStats {
  totalCustomers: number;
  totalSnacks: number;
  totalSalesInPeriod: number;
  totalCollectedInPeriod: number;
  averageTicketInPeriod: number;
  totalReceivable: number;
  unpaidSalesCount: number;
  currentMonthTotal: number;
  previousMonthTotal: number;
  monthOverMonthGrowth: number;
  topSellingSnacks: SnackRankingItem[];
  topDebtors: CustomerDebtRanking[];
  topBuyerByQuantity: CustomerBuyerRanking | null;
  topBuyerByValue: CustomerBuyerRanking | null;
  oldDebts: OldDebtAlert[];
  highRiskCustomers: HighRiskCustomerAlert[];
  monthlyHistory: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  total: number;
}

export interface SnackRankingItem {
  snackName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface CustomerDebtRanking {
  customerId: string;
  customerName: string;
  totalDebt: number;
  unpaidSalesCount: number;
}

export interface CustomerBuyerRanking {
  customerId: string;
  customerName: string;
  purchaseCount: number;
  totalSpent: number;
}

export interface OldDebtAlert {
  saleId: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  daysOverdue: number;
  amount: number;
}

export interface HighRiskCustomerAlert {
  customerId: string;
  customerName: string;
  totalDebt: number;
  unpaidSalesCount: number;
  riskReason: string;
}

export type PeriodType = 'today' | 'week' | 'month' | 'custom';
