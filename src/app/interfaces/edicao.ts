export interface Edicao {
  id: string;
  titulo: string;
  descricao: string;
  data: Date | string;
  pdfUrl?: string;
  capaUrl?: string;
}