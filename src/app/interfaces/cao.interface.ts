// Interface para o modelo de dados do cão
export interface Cao {
  // Identificação
  caoId?: string;
  nome: string;
  raca: string;
  sexo: 'macho' | 'femea';
  dataNascimento: string;
  
  // Características físicas
  peso?: string;
  altura?: string;
  cor?: string;
  
  // Fotos obrigatórias
  fotoPerfil: string; // Base64 ou caminho do arquivo
  fotoLateral: string; // Base64 ou caminho do arquivo
  
  // Pedigree (opcional)
  temPedigree?: boolean;
  registroPedigree?: string;
  pedigreeFrenteUrl?: string; // URL do arquivo
  pedigreeVersoUrl?: string; // URL do arquivo
  
  // Microchip (opcional)
  temMicrochip?: boolean;
  numeroMicrochip?: string;
  
  // Informações adicionais
  nomePai?: string;
  nomeMae?: string;
  titulos?: string;
  caracteristicas?: string;
  observacoes?: string;
  informacoesAdicionais?: string;
  
  // Vídeo (opcional)
  videoOption?: 'upload' | 'youtube' | 'whatsapp' | 'none';
  videoUrl?: string;
  whatsappContato?: string;
  
  // Metadados
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para dados do proprietário
export interface ProprietarioCao {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    cep: string;
    cidade: string;
    estado: string;
  };
}

// Interface para o payload de cadastro
export interface CadastroCaoPayload {
  cao: Cao;
  proprietario?: {
    tipoPropriedade: 'PROPRIO' | 'TERCEIRO';
    proprietarioId?: string;
    dadosProprietario?: ProprietarioCao;
  };
  videoOption?: VideoOption;
  confirmaWhatsapp?: boolean;
}

// Interface para resposta da API
export interface CadastroCaoResponse {
  success: boolean;
  message: string;
  data: {
    caoId: string;
    nome: string;
    proprietarioId: string;
    cadastradoPorId: string;
  };
}

// Interface para upload de imagens
export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    url: string;
    size: number;
    type: string;
  };
}

// Interface para validação de arquivos
export interface FileValidation {
  isValid: boolean;
  error?: string;
  file?: File;
}

// Tipos para validação
export type SexoCao = 'macho' | 'femea';
export type VideoOption = 'upload' | 'youtube' | 'whatsapp' | 'none';
export type TipoPropriedade = 'PROPRIO' | 'TERCEIRO';

// Constantes para validação
export const RACAS_CAO = [
  'golden-retriever',
  'labrador',
  'pastor-alemao',
  'border-collie',
  'bulldog-frances',
  'poodle',
  'shih-tzu',
  'yorkshire',
  'outro'
] as const;

export const TIPOS_ARQUIVO_IMAGEM = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const;

export const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024; // 5MB
export const TAMANHO_MAX_VIDEO = 50 * 1024 * 1024; // 50MB