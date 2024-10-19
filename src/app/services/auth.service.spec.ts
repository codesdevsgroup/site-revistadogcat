import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService - Refresh Token Flow', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Refresh Token Flow', () => {
    it('deve fazer refresh do token quando há refresh token válido', () => {
      const mockUser = {
        userId: '1',
        userName: 'teste',
        name: 'Teste',
        email: 'teste@teste.com',
        role: 'USER',
        active: true,
        createdAt: '2024-01-01T00:00:00Z'
      };
      const mockRefreshToken = 'valid-refresh-token';

      localStorage.setItem('refreshToken', mockRefreshToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));

      const mockRefreshResponse = {
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          user: mockUser
        },
        timestamp: '2024-01-01T00:00:00Z'
      };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockRefreshResponse);
        expect(service.getAccessToken()).toBe('new-access-token');
        expect(service.getRefreshToken()).toBe('new-refresh-token');
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: mockRefreshToken });

      req.flush(mockRefreshResponse);
    });

    it('deve limpar sessão quando refresh token é inválido', () => {
      const mockRefreshToken = 'invalid-refresh-token';
      localStorage.setItem('refreshToken', mockRefreshToken);

      service.refreshToken().subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(service.getAccessToken()).toBeNull();
          expect(service.getRefreshToken()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');

      req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('deve retornar true em ensureAuthenticated quando já está autenticado', () => {
      const mockUser = {
        userId: '1',
        userName: 'teste',
        name: 'Teste',
        email: 'teste@teste.com',
        role: 'USER',
        active: true,
        createdAt: '2024-01-01T00:00:00Z'
      };
      service.setTokens('valid-access-token', 'valid-refresh-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));

      service.ensureAuthenticated().subscribe(result => {
        expect(result).toBe(true);
      });

      httpMock.expectNone(`${environment.apiUrl}/auth/refresh`);
    });

    it('deve tentar refresh em ensureAuthenticated quando não está autenticado mas tem refresh token', () => {
      const mockUser = {
        userId: '1',
        userName: 'teste',
        name: 'Teste',
        email: 'teste@teste.com',
        role: 'USER',
        active: true,
        createdAt: '2024-01-01T00:00:00Z'
      };
      const mockRefreshToken = 'valid-refresh-token';

      localStorage.setItem('refreshToken', mockRefreshToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));

      const mockRefreshResponse = {
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          user: mockUser
        },
        timestamp: '2024-01-01T00:00:00Z'
      };

      service.ensureAuthenticated().subscribe(result => {
        expect(result).toBe(true);
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      req.flush(mockRefreshResponse);
    });

    it('deve retornar false em ensureAuthenticated quando não pode fazer refresh', () => {
      service.ensureAuthenticated().subscribe(result => {
        expect(result).toBe(false);
      });

      httpMock.expectNone(`${environment.apiUrl}/auth/refresh`);
    });

    it('deve verificar corretamente se pode fazer refresh token', () => {
      const mockUser = {
        userId: '1',
        userName: 'teste',
        name: 'Teste',
        email: 'teste@teste.com',
        role: 'USER',
        active: true,
        createdAt: '2024-01-01T00:00:00Z'
      };

      // Caso 1: Sem tokens - não pode fazer refresh
      expect(service.canRefreshToken()).toBe(false);

      // Caso 2: Com access token - não precisa fazer refresh
      service.setTokens('access-token', 'refresh-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      expect(service.canRefreshToken()).toBe(false);

      // Caso 3: Sem access token mas com refresh token e dados do usuário - pode fazer refresh
      sessionStorage.removeItem('accessToken');
      expect(service.canRefreshToken()).toBe(true);

      // Caso 4: Sem dados do usuário - não pode fazer refresh
      localStorage.removeItem('userData');
      expect(service.canRefreshToken()).toBe(false);
    });
  });
});
