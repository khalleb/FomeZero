import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PaymentMethod } from '../models/payment-method.model';
import { PagedResult } from '../models/paged-result.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private apiUrl = `${environment.apiUrl}/paymentmethods`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<PaymentMethod>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<PaymentMethod>>(this.apiUrl, { params });
  }

  getAllActive(): Observable<PaymentMethod[]> {
    return this.http.get<PagedResult<PaymentMethod>>(this.apiUrl, {
      params: new HttpParams().set('pageSize', '100')
    }).pipe(
      map(result => result.items.filter(p => p.active))
    );
  }

  getById(id: string): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.apiUrl}/${id}`);
  }

  create(paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.apiUrl, paymentMethod);
  }

  update(id: string, paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/${id}`, paymentMethod);
  }
}
