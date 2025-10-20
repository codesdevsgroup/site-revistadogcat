import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ArtigoResponseDto {
  artigoId: string;
  titulo: string;
  conteudo: any;
  resumo?: string;
  autor: {
    userId: string;
    name: string;
    avatarUrl?: string;
  };
  categoria: string;
  status: string;
  dataPublicacao: string;
  imagemCapa?: string;
  visualizacoes: number;
  curtidas: number;
  comentarios: any[];
  destaque: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Artigo {
  id: string;
  titulo: string;
  conteudo: any;
  resumo?: string;
  autor: string;
  autorId: string;
  categoria: string;
  status: 'publicado' | 'rascunho' | 'revisao';
  dataPublicacao: string;
  imagemCapa: string;
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  destaque: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface para criação/atualização de artigo
export interface ArtigoInput {
  titulo: string;
  conteudo: any;
  resumo?: string;
  autorId: string;
  categoria: string;
  status: string;
  dataPublicacao?: string;
  imagemCapa: string;
  destaque: boolean;
  tags?: string[];
}

// Interface para filtros de busca
export interface ArtigoFiltros {
  q?: string;
  categoria?: string;
  status?: string;
  sort?: string;
}

// Resposta paginada conforme documentação
export interface ArtigosListResponseDto {
  data: ArtigoResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ArtigosService {
  private readonly apiUrl = `${environment.apiUrl}/artigos`;

  constructor(private http: HttpClient) {}

  /**
   * Mapeia ArtigoResponseDto da API para interface Artigo do frontend
   */
  private mapArtigoFromApi(apiArtigo: ArtigoResponseDto): Artigo {
    return {
      id: apiArtigo.artigoId,
      titulo: apiArtigo.titulo,
      conteudo: apiArtigo.conteudo,
      resumo: apiArtigo.resumo,
      autor: apiArtigo.autor.name,
      autorId: apiArtigo.autor.userId,
      categoria: apiArtigo.categoria,
      status: this.mapStatusFromApi(apiArtigo.status),
      dataPublicacao: apiArtigo.dataPublicacao,
      imagemCapa: apiArtigo.imagemCapa || '',
      visualizacoes: apiArtigo.visualizacoes,
      curtidas: apiArtigo.curtidas,
      comentarios: apiArtigo.comentarios.length,
      destaque: apiArtigo.destaque,
      tags: apiArtigo.tags,
      createdAt: apiArtigo.createdAt,
      updatedAt: apiArtigo.updatedAt
    };
  }

  /**
   * Mapeia status da API para o frontend
   */
  private mapStatusFromApi(status: string): 'publicado' | 'rascunho' | 'revisao' {
    switch (status.toLowerCase()) {
      case 'publicado':
        return 'publicado';
      case 'rascunho':
        return 'rascunho';
      case 'revisao':
        return 'revisao';
      default:
        return 'rascunho';
    }
  }

  /**
   * Lista todos os artigos (admin) - inclui rascunhos, revisão e publicados
   * Requer autenticação
   */
  listarTodosArtigos(filtros?: ArtigoFiltros): Observable<Artigo[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.q) params = params.set('search', filtros.q); // API usa 'search' não 'q'
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.status) params = params.set('status', filtros.status);
      if (filtros.sort) {
        const [sortBy, sortOrder] = filtros.sort.split(':');
        params = params.set('sortBy', sortBy);
        params = params.set('sortOrder', sortOrder || 'desc');
      }
    }

    // Usar endpoint protegido para todos os artigos (admin)
    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map((resp) => {
        console.log('Resposta da API (admin):', resp);

        // A API retorna: { statusCode, message, data: { data: [], pagination: {} } }
        const responseData = resp?.data;

        if (!responseData || !responseData.data) {
          console.error('Resposta da API não contém dados válidos:', resp);
          return [];
        }

        if (!Array.isArray(responseData.data)) {
          console.error('responseData.data não é um array:', responseData.data);
          return [];
        }

        return responseData.data.map((artigo: ArtigoResponseDto) => this.mapArtigoFromApi(artigo));
      })
    );
  }

  /**
   * Lista todos os artigos publicados (público)
   */
  listarArtigos(filtros?: ArtigoFiltros): Observable<Artigo[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.q) params = params.set('search', filtros.q); // API usa 'search' não 'q'
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.status) params = params.set('status', filtros.status);
      if (filtros.sort) {
        const [sortBy, sortOrder] = filtros.sort.split(':');
        params = params.set('sortBy', sortBy);
        params = params.set('sortOrder', sortOrder || 'desc');
      }
    }

    // Usar endpoint público para artigos publicados
    return this.http.get<any>(`${this.apiUrl}/publicados`, { params }).pipe(
      map((resp) => {
        console.log('Resposta da API:', resp);

        // A API retorna: { statusCode, message, data: { data: [], pagination: {} } }
        const responseData = resp?.data;

        if (!responseData || !responseData.data) {
          console.error('Resposta da API não contém dados válidos:', resp);
          return [];
        }

        if (!Array.isArray(responseData.data)) {
          console.error('responseData.data não é um array:', responseData.data);
          return [];
        }

        return responseData.data.map((artigo: ArtigoResponseDto) => this.mapArtigoFromApi(artigo));
      })
    );
  }

  /**
   * Lista artigos para homepage (público)
   * API docs: GET /artigos/artigos-homepage?limit=9 -> ArtigoResponseDto[]
   */
  listarArtigosParaHomepage(limit = 9): Observable<Artigo[]> {
    let params = new HttpParams().set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/artigos-homepage`, { params }).pipe(
      map((resp) => {
        console.log('Resposta da API (artigos homepage):', resp);

        // A API retorna: { statusCode, message, data: [] }
        const artigos = resp?.data;

        if (!artigos) {
          console.error('Resposta da API não contém dados válidos:', resp);
          return [];
        }

        if (!Array.isArray(artigos)) {
          console.error('resp.data não é um array:', artigos);
          return [];
        }

        return artigos.map((artigo: ArtigoResponseDto) => this.mapArtigoFromApi(artigo));
      })
    );
  }

  /**
   * Lista artigos para a homepage: primeiro destaques por data mais recente, depois mais novos
   * Máximo de 9 artigos total
   */
  listarArtigosHomepage(): Observable<Artigo[]> {
    // Buscar artigos para homepage e artigos recentes em paralelo
    return forkJoin({
      artigosHomepage: this.listarArtigosParaHomepage(9),
      recentes: this.listarArtigos({ sort: 'dataPublicacao:desc' })
    }).pipe(
      map(({ artigosHomepage, recentes }) => {
        // Criar um Set com IDs dos artigos da homepage para evitar duplicatas
        const artigosHomepageIds = new Set(artigosHomepage.map(artigo => artigo.id));
        
        // Filtrar artigos recentes que não estão na homepage
        const recentesNaoHomepage = recentes.filter(artigo => !artigosHomepageIds.has(artigo.id));
        
        // Combinar: primeiro artigos da homepage ordenados por data, depois recentes
        const artigosOrdenados = [
          ...artigosHomepage.sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()),
          ...recentesNaoHomepage
        ];

        // Limitar a 9 artigos
        return artigosOrdenados.slice(0, 9);
      })
    );
  }

  /**
   * Lista artigos publicados (público)
   * API docs: GET /artigos/publicados -> ArtigosListResponseDto
   */
  listarPublicados(limit = 9, page = 1, sort = 'dataPublicacao:desc'): Observable<Artigo[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('page', page.toString());

    // Mapear sort para sortBy e sortOrder
    if (sort) {
      const [sortBy, sortOrder] = sort.split(':');
      params = params.set('sortBy', sortBy);
      params = params.set('sortOrder', sortOrder || 'desc');
    }

    return this.http.get<any>(`${this.apiUrl}/publicados`, { params }).pipe(
      map(resp => {
        const responseData = resp?.data;
        if (!responseData || !Array.isArray(responseData.data)) {
          return [];
        }
        return responseData.data.map((artigo: ArtigoResponseDto) => this.mapArtigoFromApi(artigo));
      })
    );
  }

  /**
   * Obtém um artigo específico por ID
   */
  obterArtigo(id: string): Observable<Artigo> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        // A API retorna: { statusCode, message, data: ArtigoResponseDto }
        const artigo = response?.data;
        if (!artigo) {
          throw new Error('Artigo não encontrado na resposta da API');
        }
        return this.mapArtigoFromApi(artigo);
      })
    );
  }

  /**
   * Cria um novo artigo
   */
  criarArtigo(artigo: ArtigoInput): Observable<Artigo> {
    return this.http.post<ArtigoResponseDto>(this.apiUrl, artigo).pipe(
      map(artigo => this.mapArtigoFromApi(artigo))
    );
  }

  /**
   * Atualiza um artigo existente
   */
  atualizarArtigo(id: string, artigo: ArtigoInput): Observable<Artigo> {
    return this.http.patch<ArtigoResponseDto>(`${this.apiUrl}/${id}`, artigo).pipe(
      map(artigo => this.mapArtigoFromApi(artigo))
    );
  }

  /**
   * Atualiza parcialmente um artigo (ex: apenas destaque)
   */
  atualizarParcialArtigo(id: string, dados: Partial<ArtigoInput>): Observable<Artigo> {
    return this.http.patch<ArtigoResponseDto>(`${this.apiUrl}/${id}`, dados).pipe(
      map(artigo => this.mapArtigoFromApi(artigo))
    );
  }

  /**
   * Exclui um artigo
   */
  excluirArtigo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Faz upload de uma imagem
   */
  uploadImagem(arquivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', arquivo);

    // Endpoint correto: POST /artigos/imagens/upload
    return this.http.post<{ url: string }>(`${this.apiUrl}/imagens/upload`, formData);
  }
}
