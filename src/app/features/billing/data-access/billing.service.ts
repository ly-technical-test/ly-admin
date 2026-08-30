import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedData } from '../../../core/http/api-response.model';
import { Charge, CheckoutCharge, IssueChargePayload, PayCardPayload } from '../models/charge.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);

  getCharges(): Observable<Charge[]> {
    return this.http
      .get<ApiResponse<Charge[]>>(`${environment.apiUrl}/billing/list`)
      .pipe(map(({ data }) => data));
  }

  getChargesPage(
    search: string,
    page: number,
    limit: number,
    status?: 'PAID' | 'PENDING',
  ): Observable<PaginatedData<Charge>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (page) params = params.set('page', page);
    if (limit) params = params.set('limit', limit);
    if (status) params = params.set('status', status);

    return this.http
      .get<ApiResponse<PaginatedData<Charge> | Charge[]>>(`${environment.apiUrl}/billing/list`, {
        params,
      })
      .pipe(
        map(({ data }) =>
          Array.isArray(data) ? { data, limit, page, total: data.length, totalPages: 1 } : data,
        ),
      );
  }

  issueCharge(payload: IssueChargePayload): Observable<Charge> {
    return this.http
      .post<ApiResponse<Charge>>(`${environment.apiUrl}/billing/issue`, payload)
      .pipe(map(({ data }) => data));
  }

  getCheckoutCharge(id: string): Observable<CheckoutCharge> {
    return this.http
      .get<ApiResponse<CheckoutCharge>>(`${environment.apiUrl}/billing/${id}`)
      .pipe(map(({ data }) => data));
  }

  payByCard(payload: PayCardPayload): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/billing/pay-card`, payload)
      .pipe(map(() => undefined));
  }

  simulatePayment(id: string, paymentMethod: 'boleto' | 'creditCard' | 'pix'): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/billing/simulate/${id}`, { paymentMethod })
      .pipe(map(() => undefined));
  }
}
