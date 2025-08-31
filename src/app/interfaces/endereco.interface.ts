export interface Endereco {
  enderecoId: string;
  userId: string;
  tipo: 'RESIDENCIAL' | 'COMERCIAL' | 'ENTREGA' | 'COBRANCA' | 'TEMPORARIO' | 'OUTRO';
  nome?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pontoReferencia?: string;
  principal: boolean;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}
