import { CadastroCao } from '../services/cadastro-cao.service';

// Tipagem para uso no Admin: estende o modelo de serviço e adiciona campos auxiliares usados na UI
export interface AdminCao extends CadastroCao {
  nomeCao?: string;
  donoCao?: {
    nome: string;
  };
  racaSugerida?: string;
  numeroRegistro?: string;
  racaId?: string;
}