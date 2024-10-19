import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard - Refresh Token Flow', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'ensureAuthenticated']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/perfil' } as RouterStateSnapshot;
  });

  describe('canActivate', () => {
    it('deve permitir acesso quando usuário já está autenticado', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(true);

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(true);
        expect(authServiceSpy.ensureAuthenticated).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('deve tentar refresh e permitir acesso quando refresh é bem-sucedido', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      authServiceSpy.ensureAuthenticated.and.returnValue(of(true));

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(true);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('deve redirecionar para login quando refresh falha', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      authServiceSpy.ensureAuthenticated.and.returnValue(of(false));

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
          queryParams: { returnUrl: '/perfil' }
        });
        done();
      });
    });

    it('deve redirecionar para login quando ensureAuthenticated gera erro', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      authServiceSpy.ensureAuthenticated.and.returnValue(throwError(() => new Error('Erro de rede')));

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
          queryParams: { returnUrl: '/perfil' }
        });
        done();
      });
    });
  });
});