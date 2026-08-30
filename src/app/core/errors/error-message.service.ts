import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';
import { ApiErrorKey, ERROR_TRANSLATIONS, isApiErrorKey } from './error-translations';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  fromHttp(error: unknown): string {
    const message = ERROR_TRANSLATIONS[this.resolveKey(error)];
    toast.error(message);
    return message;
  }

  translate(key: ApiErrorKey): string {
    return ERROR_TRANSLATIONS[key];
  }

  private resolveKey(error: unknown): ApiErrorKey {
    if (!(error instanceof HttpErrorResponse)) return 'unexpected_error';
    if (error.status === 0) return 'network_error';

    const message = error.error?.message;
    if (isApiErrorKey(message)) return message;

    return error.status === 401 ? 'unauthorized' : 'unexpected_error';
  }
}
