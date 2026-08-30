import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedData } from '../../../core/http/api-response.model';
import { CreateCustomerPayload, Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);

  getCustomers(): Observable<Customer[]> {
    return this.http
      .get<ApiResponse<Customer[]>>(`${environment.apiUrl}/customers`)
      .pipe(map(({ data }) => data));
  }

  getCustomersPage(search: string, page: number, limit: number): Observable<PaginatedData<Customer>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (page) params = params.set('page', page);
    if (limit) params = params.set('limit', limit);

    return this.http
      .get<ApiResponse<PaginatedData<Customer> | Customer[]>>(`${environment.apiUrl}/customers`, { params })
      .pipe(
        map(({ data }) =>
          Array.isArray(data) ? { data, limit, page, total: data.length, totalPages: 1 } : data,
        ),
      );
  }

  createCustomer(payload: CreateCustomerPayload): Observable<Customer> {
    return this.http
      .post<ApiResponse<Customer>>(`${environment.apiUrl}/customers`, payload)
      .pipe(map(({ data }) => data));
  }
}
