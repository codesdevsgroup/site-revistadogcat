import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ListKardexDto, KardexListResponseDto, KardexEstatisticas, KardexAuditoriaResponse, KardexResumoDiario } from '../interfaces/kardex.interface';

@Injectable({
  providedIn: 'root'
})
export class KardexService {
  private readonly apiUrl = `${environment.apiUrl}/kardex`;

  constructor(private http: HttpClient) {}

  listar(filtros: ListKardexDto): Observable<KardexListResponseDto> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<KardexListResponseDto>(`${this.apiUrl}/listar`, { params });
  }

  estatisticas(): Observable<KardexEstatisticas> {
    return this.http.get<KardexEstatisticas>(`${this.apiUrl}/estatisticas`);
  }

  historicoUsuario(userId: string, limite?: number): Observable<any[]> {
    let params = new HttpParams();
    if (limite) params = params.set('limite', limite);
    return this.http.get<any[]>(`${this.apiUrl}/historico-usuario/${userId}`, { params });
  }

  historicoCadastro(cadastroId: string, limite?: number): Observable<any[]> {
    let params = new HttpParams();
    if (limite) params = params.set('limite', limite);
    return this.http.get<any[]>(`${this.apiUrl}/historico-cadastro/${cadastroId}`, { params });
  }

  auditoria(filtros: { dataInicio?: string; dataFim?: string; adminUserId?: string }): Observable<KardexAuditoriaResponse> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params = params.set(key, String(value));
    });
    return this.http.get<KardexAuditoriaResponse>(`${this.apiUrl}/auditoria`, { params });
  }

  resumoDiario(dias?: number): Observable<KardexResumoDiario> {
    let params = new HttpParams();
    if (dias) params = params.set('dias', dias);
    return this.http.get<KardexResumoDiario>(`${this.apiUrl}/resumo-diario`, { params });
  }

  exportar(filtros: ListKardexDto): Observable<Blob> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get(`${this.apiUrl}/exportar`, { params, responseType: 'blob' });
  }
}
