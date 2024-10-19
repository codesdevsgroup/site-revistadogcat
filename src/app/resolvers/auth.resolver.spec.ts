import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthResolver } from './auth.resolver';
import { AuthService } from '../services/auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['ensureAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    resolver = TestBed.inject(AuthResolver);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/perfil' } as RouterStateSnapshot;
  });

  describe('resolve', () => {
    it('deve retornar true quando ensureAuthenticated é bem-sucedido', (done) => {
      authServiceSpy.ensureAuthenticated.and.returnValue(of(true));

      resolver.resolve().subscribe(result => {
        expect(result).toBe(true);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        done();
      });
    });

    it('deve retornar false quando ensureAuthenticated falha', (done) => {
      authServiceSpy.ensureAuthenticated.and.returnValue(of(false));

      resolver.resolve().subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        done();
      });
    });

    it('deve retornar false quando ensureAuthenticated gera erro', (done) => {
      authServiceSpy.ensureAuthenticated.and.returnValue(throwError(() => new Error('Erro de rede')));

      resolver.resolve().subscribe(result => {
        expect(result).toBe(false);
        expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
        done();
      });
    });
  });
});