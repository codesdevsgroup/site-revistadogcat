import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

// Função para adicionar o token à requisição
const addToken = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Interceptor: Erro detectado', error);
      if (error.status === 401) {
        console.log('Interceptor: Erro 401 detectado. Tentando refresh...');
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
    console.log('Interceptor: Iniciando processo de refresh token.');

    return authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.access_token);
        console.log('Interceptor: Refresh token bem-sucedido. Repetindo a requisição original.');
        return next(addToken(req, tokenResponse.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        console.error('Interceptor: Falha no refresh token. Deslogando usuário.', err);
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    console.log('Interceptor: Processo de refresh já em andamento. Aguardando novo token...');
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        console.log('Interceptor: Novo token recebido. Repetindo a requisição pendente.');
        return next(addToken(req, jwt));
      })
    );
  }
};
