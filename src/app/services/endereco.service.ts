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
  // FIX: A rota base para todos os endpoints de endereço deve ser /enderecos
  private readonly apiUrl = `${environment.apiUrl}/enderecos`;

  constructor(private http: HttpClient) { }

  // Busca a lista de endereços de um usuário
  getEnderecos(userId: string): Observable<Endereco[]> {
    // FIX: A rota correta é a raiz do serviço de endereços.
    // A API deve usar o token do usuário autenticado para filtrar os endereços corretos.
    const url = this.apiUrl;
    console.log(`🔍 [EnderecoService] Buscando endereços para o usuário autenticado (ID: ${userId})`);
    console.log('🔍 [EnderecoService] URL da requisição:', url);

    return this.http.get<Endereco[]>(url)
      .pipe(
        map(response => {
          console.log('✅ [EnderecoService] Resposta da API:', response);
          // A resposta padrão para uma lista GET deve ser um array diretamente.
          const enderecos = Array.isArray(response) ? response : [];
          console.log('✅ [EnderecoService] Endereços extraídos:', enderecos);
          return enderecos;
        }),
        catchError(error => {
          console.error('❌ [EnderecoService] Erro na requisição:', error);
          // A API pode retornar 404 se não houver endereços, então tratamos isso como um array vazio.
          if (error.status === 404) {
            console.log('ℹ️ [EnderecoService] Nenhum endereço encontrado (404), retornando array vazio.');
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  // Cria um novo endereço para um usuário
  createEndereco(userId: string, endereco: Partial<Endereco>): Observable<Endereco> {
    // FIX: A criação também deve usar a rota base /enderecos.
    // A API associará o endereço ao usuário autenticado pelo token.
    return this.http.post<Endereco>(this.apiUrl, endereco)
      .pipe(catchError(this.handleError));
  }

  // Atualiza um endereço existente
  updateEndereco(enderecoId: string, endereco: Partial<Endereco>): Observable<Endereco> {
    return this.http.put<Endereco>(`${this.apiUrl}/${enderecoId}`, endereco)
      .pipe(catchError(this.handleError));
  }

  // Exclui um endereço
  deleteEndereco(enderecoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${enderecoId}`)
      .pipe(catchError(this.handleError));
  }

  // Define um endereço como principal
  setEnderecoPrincipal(enderecoId: string): Observable<Endereco> {
    return this.http.patch<Endereco>(`${this.apiUrl}/${enderecoId}/principal`, {})
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
