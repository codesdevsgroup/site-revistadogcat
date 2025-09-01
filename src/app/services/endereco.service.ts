import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Endereco } from '../interfaces/endereco.interface';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Busca a lista de endereços de um usuário
  getEnderecos(userId: string): Observable<Endereco[]> {
    const url = `${this.apiUrl}/users/${userId}/enderecos`;
    console.log('🔍 [EnderecoService] Buscando endereços para userId:', userId);
    console.log('🔍 [EnderecoService] URL da requisição:', url);
    
    return this.http.get<{ enderecos: Endereco[] }>(url)
      .pipe(
        map(response => {
          console.log('✅ [EnderecoService] Resposta da API:', response);
          const enderecos = response.enderecos || [];
          console.log('✅ [EnderecoService] Endereços extraídos:', enderecos);
          return enderecos;
        }),
        catchError(error => {
          console.error('❌ [EnderecoService] Erro na requisição:', error);
          console.error('❌ [EnderecoService] Status do erro:', error.status);
          console.error('❌ [EnderecoService] Mensagem do erro:', error.message);
          
          // Se a API retornar 404 (Not Found), significa que o usuário não tem endereços.
          // Nesses casos, retornamos um array vazio em vez de um erro.
          if (error.status === 404) {
            console.log('ℹ️ [EnderecoService] Retornando array vazio para 404');
            return of([]);
          }
          // Para todos os outros erros, nós os propagamos.
          return this.handleError(error);
        })
      );
  }

  // Cria um novo endereço para um usuário
  createEndereco(userId: string, endereco: Partial<Endereco>): Observable<Endereco> {
    return this.http.post<Endereco>(`${this.apiUrl}/users/${userId}/enderecos`, endereco)
      .pipe(catchError(this.handleError));
  }

  // Atualiza um endereço existente
  updateEndereco(enderecoId: string, endereco: Partial<Endereco>): Observable<Endereco> {
    return this.http.put<Endereco>(`${this.apiUrl}/enderecos/${enderecoId}`, endereco)
      .pipe(catchError(this.handleError));
  }

  // Exclui um endereço
  deleteEndereco(enderecoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enderecos/${enderecoId}`)
      .pipe(catchError(this.handleError));
  }

  // Define um endereço como principal
  setEnderecoPrincipal(enderecoId: string): Observable<Endereco> {
    return this.http.patch<Endereco>(`${this.apiUrl}/enderecos/${enderecoId}/principal`, {})
      .pipe(catchError(this.handleError));
  }

  // Busca endereço via CEP (API ViaCEP)
  buscarEnderecoPorCep(cep: string): Observable<any> {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      return throwError(() => new Error('CEP deve ter 8 dígitos'));
    }
    return this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`).pipe(
      map((response: any) => {
        if (response.erro) {
          throw new Error('CEP não encontrado');
        }
        return {
          logradouro: response.logradouro,
          bairro: response.bairro,
          cidade: response.localidade, // 'localidade' é o campo para cidade no ViaCEP
          estado: response.uf
        };
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    const errorMessage = error.error?.message || error.message || 'Erro desconhecido no serviço de endereços';
    console.error('Erro na API de Endereços:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
