import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    if (this.authService.isAuthenticated() && this.authService.hasAdminAccess()) {
      return of(true);
    }

    if (this.authService.isAuthenticated() && !this.authService.hasAdminAccess()) {
      console.log('AdminGuard: Usuário sem permissão administrativa.');
      this.router.navigate(['/']);
      return of(false);
    }

    console.log('AdminGuard: Usuário não autenticado, tentando refresh token...');
    return this.authService.ensureAuthenticated().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          if (this.authService.hasAdminAccess()) {
            console.log('AdminGuard: Refresh token bem-sucedido, usuário tem permissão administrativa.');
            return true;
          } else {
            console.log('AdminGuard: Usuário sem permissão administrativa após refresh.');
            this.router.navigate(['/']);
            return false;
          }
        } else {
          console.log('AdminGuard: Falha na autenticação, redirecionando para login.');
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.log('AdminGuard: Erro durante autenticação, redirecionando para login.', error);
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}