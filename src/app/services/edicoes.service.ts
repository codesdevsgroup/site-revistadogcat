import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<Edicao[]>(this.apiUrl, { params: httpParams });
  }

  obterEdicao(id: string): Observable<Edicao> {
    return this.http.get<Edicao>(`${this.apiUrl}/${id}`);
  }

  listarUltima(): Observable<Edicao> {
    return this.http.get<Edicao>(`${this.apiUrl}/ultima`);
  }
}