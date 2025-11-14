import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Edicao } from '../interfaces/edicao';

export interface EdicoesListResponse {
  statusCode: number;
  message: string;
  data: Edicao[];
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class EdicoesService {
  private apiUrl = `${environment.apiUrl}/edicoes`;

  constructor(private http: HttpClient) {}

  listarEdicoes(params?: { ano?: number; page?: number; limit?: number }): Observable<Edicao[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.ano) httpParams = httpParams.set('ano', String(params.ano));
      if (params.page) httpParams = httpParams.set('page', String(params.page));
      if (params.limit) httpParams = httpParams.set('limit', String(params.limit));
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map((resp) => {
        const data = resp?.data;
        if (Array.isArray(data)) return data as Edicao[];
        if (Array.isArray(resp)) return resp as Edicao[];
        return [];
      })
    );
  }

  obterEdicao(id: string): Observable<Edicao> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((resp) => (resp?.data ?? resp) as Edicao)
    );
  }

  listarUltima(): Observable<Edicao> {
    return this.http.get<any>(`${this.apiUrl}/ultima`).pipe(
      map((resp) => (resp?.data ?? resp) as Edicao)
    );
  }

  /**
   * Cria uma nova edição
   * Espera um FormData com: titulo, bimestre, ano e (opcional) arquivo PDF
   */
  criarEdicao(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  atualizarEdicao(id: string, formData: FormData): Observable<Edicao> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, formData).pipe(
      map((resp) => (resp?.data ?? resp) as Edicao)
    );
  }

  excluirEdicao(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}