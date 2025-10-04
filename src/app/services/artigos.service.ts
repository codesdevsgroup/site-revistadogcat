import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para o modelo de artigo
export interface Artigo {
  id: number;
  titulo: string;
  conteudo: any; // Conteúdo JSON do TipTap
  resumo?: string; // Resumo opcional do artigo
  autor: string;
  categoria: string;
  status: 'publicado' | 'rascunho' | 'revisao';
  dataPublicacao: string;
  imagemCapa: string;
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  destaque: boolean;
  tags?: string[];
}

// Interface para criação/atualização de artigo
export interface ArtigoInput {
  titulo: string;
  conteudo: any;
  resumo?: string;
  autor: string;
  categoria: string;
  status: 'publicado' | 'rascunho' | 'revisao';
  dataPublicacao?: string;
  imagemCapa: string;
  destaque: boolean;
  tags?: string[];
}

// Interface para filtros de busca
export interface ArtigoFiltros {
  q?: string; // Busca por título ou autor
  categoria?: string;
  status?: string;
  sort?: string; // ex: 'dataPublicacao:desc'
}

@Injectable({
  providedIn: 'root'
})
export class ArtigosService {
  private readonly apiUrl = '/api/artigos';

  constructor(private http: HttpClient) {}

  /**
   * Lista todos os artigos com filtros opcionais
   */
  listarArtigos(filtros?: ArtigoFiltros): Observable<Artigo[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.q) params = params.set('q', filtros.q);
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.status) params = params.set('status', filtros.status);
      if (filtros.sort) params = params.set('sort', filtros.sort);
    }

    return this.http.get<Artigo[]>(this.apiUrl, { params });
  }

  /**
   * Lista artigos em destaque (público)
   * API docs: GET /artigos/destaques?limit=5 -> ArtigoResponseDto[]
   */
  listarDestaques(limit = 9): Observable<Artigo[]> {
    let params = new HttpParams().set('limit', limit);
    return this.http.get<Artigo[]>(`${this.apiUrl}/destaques`, { params });
  }

  /**
   * Lista artigos publicados (público)
   * API docs: GET /artigos/publicados -> ArtigosListResponseDto (paginação)
   * Para simplificar o componente de destaque, retornamos apenas um array de artigos quando possível.
   */
  listarPublicados(limit = 9, page = 1, sort = 'dataPublicacao:desc'): Observable<Artigo[]> {
    let params = new HttpParams()
      .set('limit', limit)
      .set('page', page)
      .set('sort', sort);
    return this.http.get<Artigo[]>(`${this.apiUrl}/publicados`, { params });
  }

  /**
   * Obtém um artigo específico por ID
   */
  obterArtigo(id: number): Observable<Artigo> {
    return this.http.get<Artigo>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo artigo
   */
  criarArtigo(artigo: ArtigoInput): Observable<Artigo> {
    return this.http.post<Artigo>(this.apiUrl, artigo);
  }

  /**
   * Atualiza um artigo existente
   */
  atualizarArtigo(id: number, artigo: ArtigoInput): Observable<Artigo> {
    return this.http.put<Artigo>(`${this.apiUrl}/${id}`, artigo);
  }

  /**
   * Atualiza parcialmente um artigo (ex: apenas destaque)
   */
  atualizarParcialArtigo(id: number, dados: Partial<ArtigoInput>): Observable<Artigo> {
    return this.http.patch<Artigo>(`${this.apiUrl}/${id}`, dados);
  }

  /**
   * Exclui um artigo
   */
  excluirArtigo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Faz upload de uma imagem
   */
  uploadImagem(arquivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', arquivo);
    
    return this.http.post<{ url: string }>('/api/imagens/upload', formData);
  }
}