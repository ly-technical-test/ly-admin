import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../http/api-response.model';
import { UserProfile } from './profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly cookieName = 'ly_user_profile';
  private readonly http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    const cachedProfile = this.readCookie();

    if (cachedProfile !== null) return of(cachedProfile);

    return this.http.get<ApiResponse<UserProfile>>(`${environment.apiUrl}/auth/me`).pipe(
      map(({ data }) => data),
      tap((profile) => this.writeCookie(profile)),
    );
  }

  private readCookie(): UserProfile | null {
    const prefix = `${this.cookieName}=`;
    const rawCookie = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length);

    if (rawCookie === undefined) return null;

    try {
      return JSON.parse(decodeURIComponent(rawCookie)) as UserProfile;
    } catch {
      document.cookie = `${this.cookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
      return null;
    }
  }

  private writeCookie(profile: UserProfile): void {
    const value = encodeURIComponent(JSON.stringify(profile));
    document.cookie = `${this.cookieName}=${value}; Max-Age=600; Path=/; SameSite=Lax`;
  }
}
