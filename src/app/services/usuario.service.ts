import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario } from '../interfaces/usuario.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/users`; // Corrigido conforme a implementação real

  constructor(private http: HttpClient) { }

  /**
   * Busca a lista de usuários da API.
   * @returns Um Observable com um array de usuários.
   */
  getUsers(): Observable<Usuario[]> {
    console.log('Buscando usuários em:', this.apiUrl); // Log para confirmar a URL da chamada

    return this.http.get<Usuario[]>(this.apiUrl).pipe(
      tap(response => {
        // Log para ver a resposta de sucesso crua do backend
        console.log('Resposta crua da API de usuários:', response);
      }),
      catchError(error => {
        // Log para ver o objeto de erro completo
        console.error('Erro cru na chamada da API de usuários:', error);
        // Re-lança o erro para que o componente possa lidar com ele se necessário
        return throwError(() => error);
      })
    );
  }
}
