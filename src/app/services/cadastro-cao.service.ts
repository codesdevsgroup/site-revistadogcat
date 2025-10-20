import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CaoListItem {
  cadastroCaoId: string;
  nomeCao: string;
  raca: {
    nome: string;
  };
  dataNascimento: string;
  sexo: string;
  proprietario: {
    nome: string;
  };
  createdAt: string;
}

export interface CaoListResponse {
  statusCode: number;
  message: string;
  data: CaoListItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CadastroCaoService {
  private readonly apiUrl = `${environment.apiUrl}/cadastro-cao`;

  constructor(private http: HttpClient) {}

  findAll(): Promise<CaoListResponse> {
    return this.http.get<CaoListResponse>(this.apiUrl).toPromise() as Promise<CaoListResponse>;
  }

  findOne(id: string): Promise<any> {
    return this.http.get(`${this.apiUrl}/${id}`).toPromise();
  }

  delete(id: string): Promise<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).toPromise();
  }
}