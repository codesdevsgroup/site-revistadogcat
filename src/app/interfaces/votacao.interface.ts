export type VotoTipo = 'COMUM' | 'SUPER';

export interface CreateVotoDto {
  cadastroId: string;
  tipo: VotoTipo;
}

export interface VotoItem {
  votoId: string;
  userId: string;
  cadastroId: string;
  tipo: VotoTipo;
  createdAt: string;
  ip?: string | null;
}

export interface StatusUsuarioVotos {
  votosDisponiveisComum: number;
  votosUtilizadosComum: number;
  votosDisponiveisSuper: number;
  votosUtilizadosSuper: number;
  votosRestantesComum: number;
  votosRestantesSuper: number;
}

export interface VotacaoPublicListResponse {
  votos: VotoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VotacaoEstatisticas {
  totalVotos: number;
  totalUsuariosVotaram: number;
  totalCaesComVotos: number;
  mediaVotosPorCao: number;
  caoMaisVotado: {
    cadastroId: string;
    nome: string;
    totalVotos: number;
  };
}

export interface VerificarVotoResponse {
  jaVotou: boolean;
  voto?: VotoItem;
}
