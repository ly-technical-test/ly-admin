import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../http/api-response.model';
import { AuthData, LoginPayload, RegisterPayload } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'ly_access_token';

  login(payload: LoginPayload): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap(({ data }) => this.storeToken(data.access_token)));
  }

  register(payload: RegisterPayload): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap(({ data }) => this.storeToken(data.access_token)));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.clear();
    document.cookie = 'ly_user_profile=; Max-Age=0; Path=/; SameSite=Lax';
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
}
