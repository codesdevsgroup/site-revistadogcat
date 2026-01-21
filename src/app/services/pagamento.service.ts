import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PagamentoResponse {
  pagamentoId: string;
  cadastroId: string;
  userId: string;
  valor: number;
  orderNsu: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'EXPIRADO';
  linkPagamento?: string;
  transactionId?: string;
  comprovante?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PagamentoService {
  private apiUrl = `${environment.apiUrl}/pagamento`;

  constructor(private http: HttpClient) {}

  /**
   * Cria um link de pagamento para um cadastro
   */
  criarLinkPagamento(cadastroId: string): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(
      `${this.apiUrl}/criar-link/${cadastroId}`,
      {}
    );
  }

  /**
   * Busca os dados do pagamento de um cadastro
   */
  obterPagamentoCadastro(cadastroId: string): Observable<PagamentoResponse | null> {
    return this.http.get<PagamentoResponse | null>(
      `${this.apiUrl}/cadastro/${cadastroId}`,
    );
  }

  /**
   * Busca pagamento por ID
   */
  obterPagamento(pagamentoId: string): Observable<PagamentoResponse> {
    return this.http.get<PagamentoResponse>(`${this.apiUrl}/${pagamentoId}`);
  }

  /**
   * Lista pagamentos pendentes do usuário logado
   */
  listarPendentes(): Observable<PagamentoResponse[]> {
    return this.http.get<PagamentoResponse[]>(`${this.apiUrl}/meus-pendentes`);
  }

  /**
   * Verifica status do pagamento
   */
  verificarStatus(pagamentoId: string): Observable<PagamentoResponse> {
    return this.http.get<PagamentoResponse>(
      `${this.apiUrl}/verificar/${pagamentoId}`
    );
  }

  /**
   * Busca pagamento por order NSU
   */
  buscarPorOrderNsu(orderNsu: string): Observable<PagamentoResponse | null> {
    return this.http.get<PagamentoResponse | null>(
      `${this.apiUrl}/order/${orderNsu}`
    );
  }
}
