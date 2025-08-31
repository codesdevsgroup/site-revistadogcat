import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Adiciona o token de acesso à requisição, se ele existir
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se o erro for 401 (Não Autorizado), tenta renovar o token
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            // Se a renovação for bem-sucedida, refaz a requisição original com o novo token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access_token}`,
              },
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // Se a renovação falhar, desloga o usuário e o redireciona para a página de login
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Para outros erros, apenas os propaga
      return throwError(() => error);
    })
  );
};
