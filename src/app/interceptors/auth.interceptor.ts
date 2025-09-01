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
      // Função helper para lidar com a renovação do token
      const handleRefreshToken = () => {
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
            return throwError(() => refreshError);
          })
        );
      };

      // WORKAROUND: Trata 404 em rotas protegidas como se fosse um 401 de token expirado.
      // O ideal é a API retornar 401, como diz a documentação.
      const isProtectedUrl = req.url.includes('/users/') || req.url.includes('/enderecos');
      if (error.status === 404 && isProtectedUrl) {
        console.warn('Interceptor Workaround: Tratando 404 em rota protegida como possível token expirado.');
        return handleRefreshToken();
      }

      // Lógica padrão para erros 401
      if (error.status === 401) {
        const errorMessage = error.error?.message || '';
        const noRefreshMessages = [
          'Token de acesso é obrigatório',
          'Token de acesso inválido',
          'Token de acesso revogado',
          'Usuário associado ao token não foi encontrado'
        ];

        // Se for um erro que não permite refresh, desloga imediatamente
        if (noRefreshMessages.some(msg => errorMessage.includes(msg))) {
          authService.logout();
          return throwError(() => error);
        }

        // Para 'Token de acesso expirado' ou outros 401 não listados, tenta renovar
        return handleRefreshToken();
      }

      // Para outros erros, apenas os propaga
      return throwError(() => error);
    })
  );
};
