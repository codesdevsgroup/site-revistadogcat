import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard - Refresh Token Flow', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'hasAdminAccess',
      'ensureAuthenticated'
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/admin/dashboard' } as RouterStateSnapshot;
  });

  describe('canActivate', () => {
    it('deve permitir acesso quando usuário está autenticado e tem acesso admin', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.hasAdminAccess.and.returnValue(true);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(authServiceSpy.ensureAuthenticated).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('deve redirecionar para home quando usuário está autenticado mas não tem acesso admin', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.hasAdminAccess.and.returnValue(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).not.toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });

    it('deve tentar refresh e permitir acesso quando refresh é bem-sucedido e usuário tem acesso admin', (done) => {
      authServiceSpy.isAuthenticated.and.returnValues(false, true);
      authServiceSpy.hasAdminAccess.and.returnValue(true);
      authServiceSpy.ensureAuthenticated.and.returnValue(of(true));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('deve redirecionar para home quando refresh é bem-sucedido mas usuário não tem acesso admin', (done) => {
      authServiceSpy.isAuthenticated.and.returnValues(false, true);
      authServiceSpy.hasAdminAccess.and.returnValue(false);
      authServiceSpy.ensureAuthenticated.and.returnValue(of(true));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });

    it('deve redirecionar para login quando refresh falha', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      authServiceSpy.ensureAuthenticated.and.returnValue(of(false));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        done();
      });
    });

    it('deve redirecionar para login quando ensureAuthenticated gera erro', (done) => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      authServiceSpy.ensureAuthenticated.and.returnValue(throwError(() => new Error('Erro de rede')));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        done();
      });
    });
  });
});
