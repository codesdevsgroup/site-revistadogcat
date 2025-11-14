import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { ApiResponse, ListResult } from "@app-types/api";
import { environment } from "../../environments/environment";


export type StatusCadastro = "CADASTRO_INCOMPLETO" | "APROVADO" | "REJEITADO";

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
  entidadeEmissoraPedigree?: string;
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
  listar(params?: ListCadastrosParams): Observable<ListResult<CaoListItem>> {
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
      .get<ApiResponse<ListResult<CaoListItem>>>(this.apiUrl, { params: httpParams })
      .pipe(map((response) => response?.data || ({} as ListResult<CaoListItem>)));
  }

  findOne(id: string): Promise<CadastroCao> {
    return this.http.get<ApiResponse<CadastroCao>>(`${this.apiUrl}/${id}`).toPromise().then(r => (r?.data ?? (r as any)) as CadastroCao);
  }

  /**
   * Obter cadastro por ID (Observable)
   */
  obterCadastro(id: string): Observable<CadastroCao> {
    return this.http
      .get<ApiResponse<CadastroCao>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response?.data || (response as unknown as CadastroCao)));
  }

  /**
   * Remove um cadastro pelo ID (Admin)
   */
  delete(id: string): Promise<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).toPromise();
  }

  update(id: string, data: Partial<CadastroCao>): Observable<CadastroCao> {
    return this.http.patch<ApiResponse<CadastroCao>>(`${this.apiUrl}/${id}`, data).pipe(map(response => response?.data || (response as unknown as CadastroCao)));
  }

  getPendentesRaca(limit: number = 50): Observable<CadastroCao[]> {
    return this.http.get<ApiResponse<CadastroCao[]>>(`${this.apiUrl}/pendentes-raca?limit=${limit}`).pipe(map(response => response?.data || []));
  }

  /**
   * Lista cadastros pendentes de validação (Admin)
   */
  listarPendentes(limit: number = 50): Observable<CadastroCao[]> {
    return this.http
      .get<ApiResponse<CadastroCao[]>>(`${this.apiUrl}/pendentes/validacao?limit=${limit}`)
      .pipe(map((response) => response?.data || []));
  }

  /**
   * Conta cadastros pendentes de validação (Admin)
   */
  contarPendentes(): Observable<{ count: number }> {
    return this.http
      .get<ApiResponse<{ count: number }>>(`${this.apiUrl}/pendentes/count`)
      .pipe(map((response) => response?.data || { count: 0 }));
  }

  /**
   * Aprova um cadastro (Admin)
   */
  aprovarCadastro(cadastroId: string): Observable<AprovarCadastroResponse> {
    const dto: AprovarCadastroDto = {
      acao: "APROVAR",
    };
    return this.http
      .post<ApiResponse<AprovarCadastroResponse>>(`${this.apiUrl}/${cadastroId}/aprovar`, dto)
      .pipe(map((response) => response?.data || ({} as AprovarCadastroResponse)));
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
      .post<ApiResponse<AprovarCadastroResponse>>(`${this.apiUrl}/${cadastroId}/aprovar`, dto)
      .pipe(map((response) => response?.data || ({} as AprovarCadastroResponse)));
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
      .get<ApiResponse<CadastroCao[]>>(`${this.apiUrl}/meus-cadastros`)
      .pipe(map((response) => response?.data || []));
  }

  /**
   * Upload de vídeo para um cadastro específico
   * Regras de backend: valida formato, tamanho e duração
   */
  uploadVideo(cadastroId: string, file: File): Observable<CadastroCao> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http
      .post<ApiResponse<CadastroCao>>(`${this.apiUrl}/${cadastroId}/video/upload`, formData)
      .pipe(map((response) => response?.data || (response as unknown as CadastroCao)));
  }

  /**
   * Atualiza opção de vídeo (URL, WHATSAPP ou NONE)
   */
  updateVideoOption(
    cadastroId: string,
    payload: { videoOption: 'URL' | 'WHATSAPP' | 'NONE'; videoUrl?: string }
  ): Observable<CadastroCao> {
    return this.http
      .patch<ApiResponse<CadastroCao>>(`${this.apiUrl}/${cadastroId}/video`, payload)
      .pipe(map((response) => response?.data || (response as unknown as CadastroCao)));
  }
}
