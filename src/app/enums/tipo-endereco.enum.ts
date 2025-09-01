/**
 * Enum que define os tipos de endereço disponíveis no sistema
 * Baseado na documentação da API de endereços
 */
export enum TipoEndereco {
  RESIDENCIAL = 'RESIDENCIAL',
  COMERCIAL = 'COMERCIAL',
  ENTREGA = 'ENTREGA',
  COBRANCA = 'COBRANCA',
  TEMPORARIO = 'TEMPORARIO',
  OUTRO = 'OUTRO'
}

/**
 * Labels amigáveis para exibição na interface
 */
export const TIPO_ENDERECO_LABELS = {
  [TipoEndereco.RESIDENCIAL]: 'Residencial',
  [TipoEndereco.COMERCIAL]: 'Comercial',
  [TipoEndereco.ENTREGA]: 'Entrega',
  [TipoEndereco.COBRANCA]: 'Cobrança',
  [TipoEndereco.TEMPORARIO]: 'Temporário',
  [TipoEndereco.OUTRO]: 'Outro'
};

/**
 * Array de opções para uso em formulários
 */
export const TIPOS_ENDERECO_OPTIONS = [
  { value: TipoEndereco.RESIDENCIAL, label: TIPO_ENDERECO_LABELS[TipoEndereco.RESIDENCIAL] },
  { value: TipoEndereco.COMERCIAL, label: TIPO_ENDERECO_LABELS[TipoEndereco.COMERCIAL] },
  { value: TipoEndereco.ENTREGA, label: TIPO_ENDERECO_LABELS[TipoEndereco.ENTREGA] },
  { value: TipoEndereco.COBRANCA, label: TIPO_ENDERECO_LABELS[TipoEndereco.COBRANCA] },
  { value: TipoEndereco.TEMPORARIO, label: TIPO_ENDERECO_LABELS[TipoEndereco.TEMPORARIO] },
  { value: TipoEndereco.OUTRO, label: TIPO_ENDERECO_LABELS[TipoEndereco.OUTRO] }
];