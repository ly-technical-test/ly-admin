import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../http/api-response.model';
import { AuthData } from './auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let httpTesting: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('logs in', () => {
    const response = createResponse();

    service.login({ email: 'user@email.com', password: 'password123' }).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'user@email.com', password: 'password123' });
    request.flush(response);
    expect(service.getToken()).toBe('access-token');
  });

  it('registers user', () => {
    const response = createResponse();

    service
      .register({ email: 'user@email.com', name: 'Test User', password: 'password123' })
      .subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'user@email.com',
      name: 'Test User',
      password: 'password123',
    });
    request.flush(response);
    expect(service.getToken()).toBe('access-token');
  });
});

function createResponse(): ApiResponse<AuthData> {
  return {
    code: 200,
    data: {
      access_token: 'access-token',
      user: { email: 'user@email.com', id: 'user-id', name: 'Test User' },
    },
    message: 'ok',
    metadata: {
      method: 'POST',
      responseAt: '2026-08-29T00:00:00.000Z',
      route: '/v1/auth/login',
    },
  };
}
