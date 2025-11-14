import { StatusCadastro } from '../services/cadastro-cao.service';

interface CaoListItem {
  cadastroId: string;
  nomeCao: string;
  nome?: string;
  raca: { nome: string };
  racaId?: string;
  dataNascimento: Date;
  createdAt?: Date;
  sexo: string;
  proprietario?: { nome: string };
  donoCao?: { nome: string };
  status?: StatusCadastro;
  racaSugerida?: string;
  registroPedigree?: string;
  numeroRegistro?: string;
  fotoPerfil?: string;
  fotoLateral?: string;
  pedigreeFrente?: string;
  pedigreeVerso?: string;
}

interface Raca {
  racaId: string;
  id?: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export type { CaoListItem, Raca };
