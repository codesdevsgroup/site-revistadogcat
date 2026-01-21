import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConfiguracaoResponse {
  configuracaoId: string;
  chave: string;
  valor: string;
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    return this.http.get<{ valor: number }>(`${this.apiUrl}/taxa-cadastro`);
  }

  /**
   * Atualiza a configuração da taxa (apenas admin)
   */
  atualizarTaxaCadastro(valor: number): Observable<ConfiguracaoResponse> {
    return this.http.put<ConfiguracaoResponse>(
      `${this.apiUrl}/taxa-cadastro`,
      { valor },
    );
  }

  /**
   * Lista todas as configurações (apenas admin)
   */
  listarTodas(): Observable<ConfiguracaoResponse[]> {
    return this.http.get<ConfiguracaoResponse[]>(`${this.apiUrl}`);
  }
}
