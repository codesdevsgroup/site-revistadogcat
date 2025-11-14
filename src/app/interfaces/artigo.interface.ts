// Interfaces de Artigos (público e admin)
// Mantidas separadas para reutilização em serviços e componentes

export interface ArtigoResponseDto {
  artigoId: string;
  titulo: string;
  conteudo: unknown;
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
  comentarios: unknown[];
  destaque: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Artigo {
  id: string;
  titulo: string;
  conteudo: unknown;
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

export interface ArtigoInput {
  titulo: string;
  conteudo: unknown;
  resumo?: string;
  autorId: string;
  categoria: string;
  status: string;
  dataPublicacao?: string;
  imagemCapa?: string;
  destaque: boolean;
  tags?: string[];
}

export interface ArtigoFiltros {
  q?: string;
  categoria?: string;
  status?: string;
  sort?: string;
}

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
