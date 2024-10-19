import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Resolver que tenta fazer refresh do token automaticamente
 * antes de carregar rotas protegidas
 */
@Injectable({
  providedIn: 'root'
})
export class AuthResolver implements Resolve<boolean> {

  constructor(private authService: AuthService) {}

  resolve(): Observable<boolean> {
    console.log('AuthResolver: Verificando autenticação...');
    return this.authService.ensureAuthenticated().pipe(
      catchError((error) => {
        console.log('AuthResolver: Erro ao verificar autenticação.', error);
        return of(false);
      })
    );
  }
}
