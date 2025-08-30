import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Usuario } from '../interfaces/usuario.interface';
import { environment } from '../../environments/environment';

// Interface que descreve a estrutura completa da resposta da API
export interface PaginatedUsersResponse {
  statusCode: number;
  message: string;
  data: {
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Busca a lista de usuários da API.
   * @returns Um Observable com um array de usuários.
   */
  getUsers(): Observable<Usuario[]> {
    console.log('Buscando usuários em:', this.apiUrl);

    // Agora esperamos o objeto de paginação completo
    return this.http.get<PaginatedUsersResponse>(this.apiUrl).pipe(
      tap(response => {
        console.log('Resposta crua da API de usuários:', response);
      }),
      // Usamos o operador map para extrair o array de usuários de dentro da resposta
      map(response => response.data.data),
      catchError(error => {
        console.error('Erro cru na chamada da API de usuários:', error);
        return throwError(() => error);
      })
    );
  }
}
