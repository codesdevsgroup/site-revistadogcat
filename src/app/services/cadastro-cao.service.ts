import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

export type StatusCadastro = "PENDENTE" | "APROVADO" | "REJEITADO";

export interface CadastroCao {
  cadastroId: string;
  userId: string;
  nome: string;
  raca?: string;
  sexo: string;
  dataNascimento: Date;
  fotoPerfil: string;
  fotoLateral: string;
  peso?: string;
  altura?: string;
  temPedigree: boolean;
  registroPedigree?: string;
  pedigreeFrente?: string;
  pedigreeVerso?: string;
  temMicrochip: boolean;
  numeroMicrochip?: string;
  titulos?: string;
  caracteristicas?: string;
  videoOption: string;
  videoUrl?: string;
  whatsappContato?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
  status: StatusCadastro;
  motivoRejeicao?: string;
  aprovadoPor?: string;
  aprovadoEm?: Date;
  ativo: boolean;
  totalVotos: number;
}

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
  status?: StatusCadastro;
  ativo?: boolean;
}

export interface CaoListResponse {
  statusCode: number;
  message: string;
  data: CaoListItem[];
}

export interface ListCadastrosParams {
  page?: string;
  limit?: string;
  search?: string;
  raca?: string;
  sexo?: string;
  cidade?: string;
  estado?: string;
  status?: StatusCadastro;
  ativo?: string;
  pendentesValidacao?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AprovarCadastroDto {
  acao: "APROVAR" | "REJEITAR";
  motivoRejeicao?: string;
}

export interface AprovarCadastroResponse {
  cadastroId: string;
  status: string;
  mensagem: string;
  dataAcao: Date;
}

@Injectable({
  providedIn: "root",
})
export class CadastroCaoService {
  private readonly apiUrl = `${environment.apiUrl}/cadastro-cao`;

  constructor(private http: HttpClient) {}

  findAll(): Promise<CaoListResponse> {
    return this.http
      .get<CaoListResponse>(this.apiUrl)
      .toPromise() as Promise<CaoListResponse>;
  }

  /**
   * Lista cadastros com filtros
   */
  listar(params?: ListCadastrosParams): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<any>(this.apiUrl, { params: httpParams })
      .pipe(map((response) => response?.data || response));
  }

  findOne(id: string): Promise<any> {
    return this.http.get(`${this.apiUrl}/${id}`).toPromise();
  }

  /**
   * Obter cadastro por ID (Observable)
   */
  obterCadastro(id: string): Observable<CadastroCao> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Remove um cadastro pelo ID (Admin)
   */
  delete(id: string): Promise<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).toPromise();
  }

  update(id: string, data: Partial<CadastroCao>): Observable<CadastroCao> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data).pipe(map(response => response?.data || response));
  }

  getPendentesRaca(limit: number = 50): Observable<CadastroCao[]> {
    return this.http.get<any>(`${this.apiUrl}/pendentes-raca?limit=${limit}`).pipe(map(response => response?.data || response));
  }

  /**
   * Lista cadastros pendentes de validação (Admin)
   */
  listarPendentes(limit: number = 50): Observable<CadastroCao[]> {
    return this.http
      .get<any>(`${this.apiUrl}/pendentes/validacao?limit=${limit}`)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Conta cadastros pendentes de validação (Admin)
   */
  contarPendentes(): Observable<{ count: number }> {
    return this.http
      .get<any>(`${this.apiUrl}/pendentes/count`)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Aprova um cadastro (Admin)
   */
  aprovarCadastro(cadastroId: string): Observable<AprovarCadastroResponse> {
    const dto: AprovarCadastroDto = {
      acao: "APROVAR",
    };
    return this.http
      .post<any>(`${this.apiUrl}/${cadastroId}/aprovar`, dto)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Rejeita um cadastro (Admin)
   */
  rejeitarCadastro(
    cadastroId: string,
    motivo: string,
  ): Observable<AprovarCadastroResponse> {
    const dto: AprovarCadastroDto = {
      acao: "REJEITAR",
      motivoRejeicao: motivo,
    };
    return this.http
      .post<any>(`${this.apiUrl}/${cadastroId}/aprovar`, dto)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Verifica se há cadastros pendentes (para badge)
   */
  verificarPendentes(): Observable<boolean> {
    return this.contarPendentes().pipe(map((result) => result.count > 0));
  }

  /**
   * Lista cadastros do usuário autenticado
   */
  meusCadastros(): Observable<CadastroCao[]> {
    return this.http
      .get<any>(`${this.apiUrl}/meus-cadastros`)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Upload de vídeo para um cadastro específico
   * Regras de backend: valida formato, tamanho e duração
   */
  uploadVideo(cadastroId: string, file: File): Observable<CadastroCao> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http
      .post<any>(`${this.apiUrl}/${cadastroId}/video/upload`, formData)
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Atualiza opção de vídeo (URL, WHATSAPP ou NONE)
   */
  updateVideoOption(
    cadastroId: string,
    payload: { videoOption: 'URL' | 'WHATSAPP' | 'NONE'; videoUrl?: string }
  ): Observable<CadastroCao> {
    return this.http
      .patch<any>(`${this.apiUrl}/${cadastroId}/video`, payload)
      .pipe(map((response) => response?.data || response));
  }
}
