import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Snack } from '../models/snack.model';
import { PagedResult } from '../models/paged-result.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SnackService {
  private apiUrl = `${environment.apiUrl}/snacks`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, pageSize: number = 10, search?: string): Observable<PagedResult<Snack>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedResult<Snack>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Snack> {
    return this.http.get<Snack>(`${this.apiUrl}/${id}`);
  }

  create(snack: Snack): Observable<Snack> {
    return this.http.post<Snack>(this.apiUrl, snack);
  }

  update(id: string, snack: Snack): Observable<Snack> {
    return this.http.put<Snack>(`${this.apiUrl}/${id}`, snack);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
