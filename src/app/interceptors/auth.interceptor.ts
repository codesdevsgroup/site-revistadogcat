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
            // Não limpa a sessão aqui - deixa o AuthService gerenciar
            return throwError(() => error);
        }
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

      return authService.refreshToken().pipe(
        switchMap((response) => {
          isRefreshing = false;
          // Access access_token from the 'data' property
          refreshTokenSubject.next(response.data.access_token);
          return next(addTokenToRequest(req, response.data.access_token));
        }),
        catchError((err) => {
          isRefreshing = false;
          // Não chama logout aqui para evitar loop infinito
          // O AuthService já limpa a sessão e redireciona no método refreshToken
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next(addTokenToRequest(req, jwt));
        })
      );
    }
};
