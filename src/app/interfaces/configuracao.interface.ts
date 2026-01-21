export interface ConfiguracaoResponse {
  configuracaoId: string;
  chave: string;
  valor: string;
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}
