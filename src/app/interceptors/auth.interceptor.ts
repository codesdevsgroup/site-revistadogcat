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
      // Se o erro for 401 (Não Autorizado), analisa a mensagem para decidir a ação
      if (error.status === 401) {
        const errorMessage = error.error?.message || '';
        
        // Casos onde não devemos tentar refresh token
        const noRefreshMessages = [
          'Token de acesso é obrigatório',
          'Token de acesso inválido',
          'Token de acesso revogado',
          'Usuário associado ao token não foi encontrado'
        ];
        
        // Se for um erro que não permite refresh, desloga imediatamente
        if (noRefreshMessages.some(msg => errorMessage.includes(msg))) {
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }
        
        // Se for token expirado, tenta renovar
        if (errorMessage.includes('Token de acesso expirado')) {
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
        
        // Para outros casos de 401, desloga
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      // Para outros erros, apenas os propaga
      return throwError(() => error);
    })
  );
};
