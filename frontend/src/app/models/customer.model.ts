export interface Customer {
  id?: string;
  name: string;
  whatsApp: string;
  whatsAppFormatted?: string;
  active: boolean;
  credit?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerCredit {
  id: string;
  customerId: string;
  amount: number;
  type: string;
  description: string;
  referenceDate: Date;
  createdAt: Date;
}

export interface AddCreditRequest {
  customerId: string;
  amount: number;
  description: string;
  referenceDate?: Date;
}

export interface UseCreditRequest {
  customerId: string;
  amount: number;
  description: string;
  referenceDate?: Date;
}
