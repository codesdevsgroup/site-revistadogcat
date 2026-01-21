import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConfiguracaoResponse, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoService {
  private apiUrl = `${environment.apiUrl}/configuracao`;

  constructor(private http: HttpClient) {}

  /**
   * Obtém a configuração atual da taxa de cadastro
   */
  obterTaxaCadastro(): Observable<{ valor: number }> {
    return this.http
      .get<ApiResponse<{ valor: number }>>(`${this.apiUrl}/taxa-cadastro`)
      .pipe(map((response) => response.data));
  }

  /**
   * Atualiza a configuração da taxa (apenas admin)
   */
  atualizarTaxaCadastro(valor: number): Observable<ConfiguracaoResponse> {
    return this.http
      .put<ApiResponse<ConfiguracaoResponse>>(`${this.apiUrl}/taxa-cadastro`, {
        valor,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Lista todas as configurações (apenas admin)
   */
  listarTodas(): Observable<ConfiguracaoResponse[]> {
    return this.http
      .get<ApiResponse<ConfiguracaoResponse[]>>(`${this.apiUrl}`)
      .pipe(map((response) => response.data));
  }
}
