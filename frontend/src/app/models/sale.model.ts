import { Customer } from './customer.model';
import { Snack } from './snack.model';

export interface SaleItem {
  id?: string;
  saleId?: string;
  snackId: string;
  snack?: Snack;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
  subTotal?: number;
}

export interface Sale {
  id?: string;
  customerId: string;
  customer?: Customer;
  saleDate?: Date;
  isPaid: boolean;
  paidAt?: Date;
  items: SaleItem[];
  totalAmount?: number;
  createdAt?: Date;
}

export interface CustomerDebt {
  customerId: string;
  totalDebt: number;
}

export interface CustomerDebtSummary {
  customerId: string;
  customerName: string;
  customerWhatsApp: string;
  totalDebt: number;
  customerCredit: number;
  unpaidSalesCount: number;
  oldestSaleDate?: Date;
}
