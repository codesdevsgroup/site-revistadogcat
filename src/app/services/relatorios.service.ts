import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  categoria?: string;
  tipoVoto?: 'NORMAL' | 'SUPER';
  incluirHistorico?: boolean;
  incluirGraficos?: boolean;
  incluirFotos?: boolean;
}

export interface StatusRelatorio {
  relatorioId: string;
  status: 'pendente' | 'processando' | 'concluido' | 'erro' | 'expirado';
  progresso?: number;
  etapaAtual?: string;
  urlDownload?: string;
  tamanhoArquivo?: string;
  validoAte?: string;
  estimativaMinutos?: number;
}

export interface RelatorioResponse {
  success: boolean;
  data: StatusRelatorio;
}

export interface KardexRelatorio {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    totalVotos: number;
    votosNormais: number;
    superVotos: number;
    totalPontos: number;
    usuariosAtivos: number;
    caesVotados: number;
  };
  ranking: Array<{
    posicao: number;
    cao: {
      id: string;
      nome: string;
      foto?: string;
    };
    totalPontos: number;
    totalVotos: number;
  }>;
  atividade: Array<{
    data: string;
    votos: number;
    pontos: number;
    usuariosAtivos: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class RelatoriosService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Exporta dados de cães e votos em formato CSV
   */
  exportarCSV(filtros: FiltrosRelatorio): Observable<Blob> {
    let params = new HttpParams();
    
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim);
    }
    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }
    if (filtros.tipoVoto) {
      params = params.set('tipoVoto', filtros.tipoVoto);
    }
    if (filtros.incluirHistorico !== undefined) {
      params = params.set('incluirHistorico', filtros.incluirHistorico.toString());
    }

    return this.http.get(`${this.apiUrl}/exportacao/csv`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Exporta histórico de votos em formato CSV
   */
  exportarHistoricoCSV(filtros: FiltrosRelatorio): Observable<Blob> {
    let params = new HttpParams();
    
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim);
    }

    return this.http.get(`${this.apiUrl}/exportacao/historico-csv`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Solicita geração de relatório PDF premium
   */
  gerarRelatorioPDF(filtros: FiltrosRelatorio): Observable<RelatorioResponse> {
    const body = {
      dataInicio: filtros.dataInicio,
      dataFim: filtros.dataFim,
      incluirGraficos: filtros.incluirGraficos ?? true,
      incluirFotos: filtros.incluirFotos ?? true
    };

    return this.http.post<RelatorioResponse>(`${this.apiUrl}/relatorios/pdf-premium`, body);
  }

  /**
   * Verifica status de um relatório PDF
   */
  verificarStatusRelatorio(relatorioId: string): Observable<RelatorioResponse> {
    return this.http.get<RelatorioResponse>(`${this.apiUrl}/relatorios/pdf-premium/${relatorioId}/status`);
  }

  /**
   * Faz download de um relatório PDF
   */
  downloadRelatorio(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/relatorios/download/${filename}`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtém relatório geral do kardex
   */
  obterRelatorioKardex(filtros: FiltrosRelatorio): Observable<{ success: boolean; data: KardexRelatorio }> {
    let params = new HttpParams();
    
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim);
    }
    params = params.set('tipo', 'geral');

    return this.http.get<{ success: boolean; data: KardexRelatorio }>(`${this.apiUrl}/kardex/relatorio`, { params });
  }

  /**
   * Utilitário para fazer download de blob
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Gera nome de arquivo baseado nos filtros
   */
  gerarNomeArquivo(tipo: 'csv' | 'historico' | 'pdf', filtros: FiltrosRelatorio): string {
    const hoje = new Date().toISOString().split('T')[0];
    const periodo = filtros.dataInicio && filtros.dataFim 
      ? `${filtros.dataInicio}_${filtros.dataFim}`
      : hoje;

    switch (tipo) {
      case 'csv':
        return `votacao_caes_${periodo}.csv`;
      case 'historico':
        return `historico_votos_${periodo}.csv`;
      case 'pdf':
        return `relatorio_premium_${periodo}.pdf`;
      default:
        return `relatorio_${periodo}.csv`;
    }
  }
}