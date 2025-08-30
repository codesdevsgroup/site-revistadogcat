import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Por enquanto, vamos pegar o token do localStorage.
  // O ideal é que um serviço de autenticação gerencie isso.
  const authToken = localStorage.getItem('access_token');

  // Se não houver token, apenas deixa a requisição passar sem modificação.
  if (!authToken) {
    return next(req);
  }

  // Clona a requisição e adiciona o cabeçalho de autorização.
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });

  // Passa a requisição clonada com o cabeçalho para o próximo handler.
  return next(authReq);
};
