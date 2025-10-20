import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Raca {
  racaId: string;
  nome: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRacaDto {
  nome: string;
}

export interface UpdateRacaDto {
  nome?: string;
  ativo?: boolean;
}

export interface RacaResponse {
  statusCode: number;
  message: string;
  data: Raca[];
}

export interface SingleRacaResponse {
  statusCode: number;
  message: string;
  data: Raca;
}

@Injectable({
  providedIn: 'root'
})
export class RacaService {
  private readonly apiUrl = `${environment.apiUrl}/racas`;

  constructor(private http: HttpClient) {}

  findAll(ativo?: boolean, search?: string): Promise<RacaResponse> {
    let params: any = {};
    
    if (ativo !== undefined) {
      params.ativo = ativo.toString();
    }
    
    if (search) {
      params.search = search;
    }

    return this.http.get<RacaResponse>(this.apiUrl, { params }).toPromise() as Promise<RacaResponse>;
  }

  findOne(id: string): Promise<SingleRacaResponse> {
    return this.http.get<SingleRacaResponse>(`${this.apiUrl}/${id}`).toPromise() as Promise<SingleRacaResponse>;
  }

  create(createRacaDto: CreateRacaDto): Promise<SingleRacaResponse> {
    return this.http.post<SingleRacaResponse>(this.apiUrl, createRacaDto).toPromise() as Promise<SingleRacaResponse>;
  }

  update(id: string, updateRacaDto: UpdateRacaDto): Promise<SingleRacaResponse> {
    return this.http.patch<SingleRacaResponse>(`${this.apiUrl}/${id}`, updateRacaDto).toPromise() as Promise<SingleRacaResponse>;
  }

  delete(id: string): Promise<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).toPromise();
  }
}