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

  it('translates lytex_card_invalid', () => {
    const error = new HttpErrorResponse({
      error: { message: 'lytex_card_invalid' },
      status: 400,
    });

    expect(service.fromHttp(error)).toBe('O cartão de crédito informado é inválido.');
  });

  it('translates lytex_invoice_limit_exceeded', () => {
    const error = new HttpErrorResponse({
      error: { message: 'lytex_invoice_limit_exceeded' },
      status: 400,
    });

    expect(service.fromHttp(error)).toBe('O teto de emissão de cobranças foi atingido.');
  });

  it('translates network error', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(service.fromHttp(error)).toBe('Não foi possível conectar ao servidor.');
  });
});
