import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ErrorMessageService } from './error-message.service';

describe('ErrorMessageService', () => {
  const service = TestBed.inject(ErrorMessageService);

  it('translates api error', () => {
    const error = new HttpErrorResponse({
      error: { message: 'invalid_credentials' },
      status: 401,
    });

    expect(service.fromHttp(error)).toBe('E-mail ou senha incorretos.');
  });

  it('translates network error', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(service.fromHttp(error)).toBe('Não foi possível conectar ao servidor.');
  });
});
