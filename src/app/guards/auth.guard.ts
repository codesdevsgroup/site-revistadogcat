import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {

    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    console.log('AuthGuard: Usuário não autenticado, tentando refresh token...');
    return this.authService.ensureAuthenticated().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          console.log('AuthGuard: Refresh token bem-sucedido, permitindo acesso.');
          return true;
        } else {
          console.log('AuthGuard: Falha na autenticação, redirecionando para login.');
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      }),
      catchError((error) => {
        console.log('AuthGuard: Erro durante autenticação, redirecionando para login.', error);
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }
}
