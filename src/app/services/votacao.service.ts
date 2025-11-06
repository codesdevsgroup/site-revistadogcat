import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateVotoDto, StatusUsuarioVotos, VotoItem, VotacaoPublicListResponse, VotacaoEstatisticas, VerificarVotoResponse, VotoTipo } from '../interfaces/votacao.interface';

/**
 * Serviço responsável por operações de votação.
 * Observação: O AuthInterceptor já adiciona automaticamente o header Authorization quando houver token.
 */
@Injectable({ providedIn: 'root' })
export class VotacaoService {
  private readonly apiUrl = `${environment.apiUrl}/votacao`;

  constructor(private http: HttpClient) {}

  votar(payload: CreateVotoDto): Observable<VotoItem> {
    return this.http.post<VotoItem>(`${this.apiUrl}/votar`, payload);
  }

  remover(cadastroId: string, tipo: VotoTipo): Observable<void> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.delete<void>(`${this.apiUrl}/remover/${cadastroId}`, { params });
  }

  meusVotos(): Observable<VotoItem[]> {
    return this.http.get<VotoItem[]>(`${this.apiUrl}/meus-votos`);
  }

  statusUsuario(): Observable<StatusUsuarioVotos> {
    return this.http.get<StatusUsuarioVotos>(`${this.apiUrl}/status-usuario`);
  }

  verificarVoto(cadastroId: string, tipo?: VotoTipo): Observable<VerificarVotoResponse> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<VerificarVotoResponse>(`${this.apiUrl}/verificar-voto/${cadastroId}`, { params });
  }

  listarPublico(page = 1, limit = 10, filters?: { userId?: string; cadastroId?: string; tipo?: VotoTipo; dataInicial?: string; dataFinal?: string; }): Observable<VotacaoPublicListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params = params.set(key, String(value));
      });
    }
    return this.http.get<VotacaoPublicListResponse>(`${this.apiUrl}/publico/listar`, { params });
  }

  // SSE stream pode ser integrado futuramente para atualizar totalVotos em tempo real
}