import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.setItem('ly_access_token', 'access-token');
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('adds bearer token', () => {
    http.get('/resource').subscribe();
    const request = httpTesting.expectOne('/resource');
    expect(request.request.headers.get('Authorization')).toBe('Bearer access-token');
    request.flush({});
  });

  it('clears unauthorized session', () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/resource').subscribe({ error: () => undefined });
    const request = httpTesting.expectOne('/resource');
    request.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.length).toBe(0);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
