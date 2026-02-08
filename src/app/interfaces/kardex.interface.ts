import { VotoTipo } from './votacao.interface';

export enum AcaoKardex {
  VOTO_CRIADO = 'VOTO_CRIADO',
  VOTO_REMOVIDO = 'VOTO_REMOVIDO',
  VOTO_INVALIDADO = 'VOTO_INVALIDADO',
  USUARIO_BLOQUEADO = 'USUARIO_BLOQUEADO',
  CADASTRO_DESATIVADO = 'CADASTRO_DESATIVADO',
  OUTROS = 'OUTROS'
}

export interface KardexItem {
  kardexId: string;
  userId: string;
  cadastroId: string;
  acao: AcaoKardex;
  tipo?: VotoTipo;
  ip?: string;
  userAgent?: string;
  observacoes?: string;
  createdAt: string;
  // Optional relations (populated if needed)
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  cadastro?: {
    id: string;
    nome: string;
    raca?: string;
  };
  adminResponsavel?: {
    id: string;
    nome: string;
  };
}

export interface ListKardexDto {
  page?: number;
  limit?: number;
  userId?: string;
  cadastroId?: string;
  acao?: AcaoKardex;
  tipo?: VotoTipo;
  dataInicial?: string;
  dataFinal?: string;
  ip?: string;
}

export interface KardexListResponseDto {
  kardex: KardexItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KardexEstatisticas {
  totalRegistros: number;
  porAcao: Array<{ acao: AcaoKardex; quantidade: number }>;
}

export interface KardexResumoDiario {
  periodo: string;
  resumo: Array<{
    data: string;
    votos: number;
    remocoes: number;
    invalidacoes: number;
    outros: number;
  }>;
}

export interface KardexAuditoriaResponse {
  periodo: { inicio: string; fim: string };
  estatisticas: {
    totalRegistros: number;
    porAcao: Record<AcaoKardex, number>;
    porUsuario: Record<string, number>;
  };
  registros: KardexItem[];
}
