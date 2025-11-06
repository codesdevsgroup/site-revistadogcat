import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { tap, catchError, map } from "rxjs/operators";
import { Usuario } from "../interfaces/usuario.interface";
import { PaginatedUsersResponse, UserFilters } from "../dtos/usuario.dto";
import { environment } from "../../environments/environment";

// Tipagens movidas para src/app/dtos/usuario.dto.ts

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters: UserFilters = {}): Observable<Usuario[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params = params.set(key, value);
      }
    });

    return this.http.get<PaginatedUsersResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.data.data),
      catchError(this.handleError),
    );
  }

  /**
   * Cria um novo usuário (requer permissão de Admin).
   * @param usuario Dados do novo usuário.
   */
  createUser(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http
      .post<Usuario>(this.apiUrl, usuario)
      .pipe(catchError(this.handleError));
  }

  /**
   * Atualiza um usuário existente (requer permissão de Admin).
   * @param userId ID do usuário a ser atualizado.
   * @param usuario Dados a serem atualizados.
   */
  updateUser(userId: string, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http
      .patch<Usuario>(`${this.apiUrl}/${userId}`, usuario)
      .pipe(catchError(this.handleError));
  }

  /**
   * Desbloqueia um usuário bloqueado por tentativas de login (requer permissão de Admin).
   * @param userId ID do usuário a ser desbloqueado.
   */
  unblockUser(userId: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/${userId}/unblock`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error("Erro na chamada da API de usuários:", error);
    return throwError(() => error);
  }
}
