import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, CustomerDebt, CustomerDebtSummary } from '../models/sale.model';
import { PagedResult } from '../models/paged-result.model';
import { environment } from '../../environments/environment';

export interface PaymentDetail {
  paymentMethodId: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<Sale>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<Sale>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  getByCustomerId(customerId: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<Sale>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<Sale>>(`${this.apiUrl}/customer/${customerId}`, { params });
  }

  getUnpaid(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<Sale>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<Sale>>(`${this.apiUrl}/unpaid`, { params });
  }

  getCustomerDebt(customerId: string): Observable<CustomerDebt> {
    return this.http.get<CustomerDebt>(`${this.apiUrl}/customer/${customerId}/debt`);
  }

  getUnpaidByCustomerId(customerId: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<Sale>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<Sale>>(`${this.apiUrl}/customer/${customerId}/unpaid`, { params });
  }

  getCustomersWithDebts(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<CustomerDebtSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<CustomerDebtSummary>>(`${this.apiUrl}/debts`, { params });
  }

  create(sale: any, payments?: PaymentDetail[]): Observable<Sale> {
    const body = { ...sale };
    if (payments && payments.length > 0) {
      body.payments = payments;
    }
    return this.http.post<Sale>(this.apiUrl, body);
  }

  markAsPaid(id: string, paidAt?: Date, payments?: PaymentDetail[]): Observable<void> {
    const body: { paidAt?: string; payments?: PaymentDetail[] } = {};
    if (paidAt) {
      body.paidAt = paidAt.toISOString();
    }
    if (payments && payments.length > 0) {
      body.payments = payments;
    }
    return this.http.patch<void>(`${this.apiUrl}/${id}/pay`, body);
  }

  cancel(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
