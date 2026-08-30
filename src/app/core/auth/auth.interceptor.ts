import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorMessageService } from '../errors/error-message.service';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const errorMessageService = inject(ErrorMessageService);
  const router = inject(Router);
  const token = authService.getToken();
  const authenticatedRequest =
    token === null
      ? request
      : request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        errorMessageService.fromHttp(error);
        authService.logout();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
