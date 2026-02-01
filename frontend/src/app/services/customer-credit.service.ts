import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerCredit, AddCreditRequest, UseCreditRequest } from '../models/customer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerCreditService {
  private apiUrl = `${environment.apiUrl}/customercredits`;

  constructor(private http: HttpClient) {}

  getByCustomerId(customerId: string): Observable<CustomerCredit[]> {
    return this.http.get<CustomerCredit[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getBalance(customerId: string): Observable<{ customerId: string; balance: number }> {
    return this.http.get<{ customerId: string; balance: number }>(`${this.apiUrl}/customer/${customerId}/balance`);
  }

  addCredit(request: AddCreditRequest): Observable<CustomerCredit> {
    return this.http.post<CustomerCredit>(`${this.apiUrl}/add`, request);
  }

  useCredit(request: UseCreditRequest): Observable<CustomerCredit> {
    return this.http.post<CustomerCredit>(`${this.apiUrl}/use`, request);
  }
}
