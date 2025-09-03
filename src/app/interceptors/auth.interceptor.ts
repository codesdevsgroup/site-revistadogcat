import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

const addTokenToRequest = (
  request: HttpRequest<any>,
  token: string
): HttpRequest<any> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  if (accessToken) {
    req = addTokenToRequest(req, accessToken);
  }

  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Exclude auth endpoints to avoid infinite loops
        if (req.url.includes('/auth/refresh') || 
            req.url.includes('/auth/login') || 
            req.url.includes('/auth/logout')) {
            console.log('AuthInterceptor: 401 em endpoint de auth, propagando erro:', req.url);
            // Não limpa a sessão aqui - deixa o AuthService gerenciar
            return throwError(() => error);
        }
        console.log('AuthInterceptor: 401 detectado, tentando refresh token para:', req.url);
        return handle401Error(req, next, authService);
      }

      return throwError(() => error);
    })
  );
};

const handle401Error = (
    req: HttpRequest<any>,
    next: HttpHandlerFn,
    authService: AuthService
  ) => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);
      console.log('AuthInterceptor: Iniciando refresh token...');

      return authService.refreshToken().pipe(
        switchMap((response) => {
          isRefreshing = false;
          console.log('AuthInterceptor: Refresh token bem-sucedido, reenviando requisição.');
          // Access access_token from the 'data' property
          refreshTokenSubject.next(response.data.access_token);
          return next(addTokenToRequest(req, response.data.access_token));
        }),
        catchError((err) => {
          isRefreshing = false;
          console.log('AuthInterceptor: Falha no refresh token, sessão será limpa pelo AuthService:', err);
          // Não chama logout aqui para evitar loop infinito
          // O AuthService já limpa a sessão e redireciona no método refreshToken
          return throwError(() => err);
        })
      );
    } else {
      console.log('AuthInterceptor: Refresh já em andamento, aguardando...');
      return refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          console.log('AuthInterceptor: Usando token renovado para requisição em fila.');
          return next(addTokenToRequest(req, jwt));
        })
      );
    }
};
