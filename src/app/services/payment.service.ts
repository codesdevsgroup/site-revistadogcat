import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { ApiResponse } from '@app-types/api';

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
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/pagamento`;

  constructor(private http: HttpClient) {}

  /**
   * Cria um link de pagamento para um cadastro de cão
   */
  criarPagamento(cadastroId: string): Observable<PagamentoResponse> {
    return this.http
      .post<ApiResponse<PagamentoResponse>>(`${this.apiUrl}/criar-link/${cadastroId}`, {})
      .pipe(map((response) => response?.data || (response as any)));
  }

  /**
   * Consulta o status de um pagamento por ID de cadastro
   */
  consultarStatusPorCadastro(cadastroId: string): Observable<PagamentoResponse | null> {
    return this.http
      .get<ApiResponse<PagamentoResponse>>(`${this.apiUrl}/cadastro/${cadastroId}`)
      .pipe(map((response) => response?.data || null));
  }

  /**
   * Busca um pagamento por ID
   */
  buscarPagamento(pagamentoId: string): Observable<PagamentoResponse> {
    return this.http
      .get<ApiResponse<PagamentoResponse>>(`${this.apiUrl}/${pagamentoId}`)
      .pipe(map((response) => response?.data || (response as any)));
  }

  /**
   * Lista todos os pagamentos pendentes do usuário logado
   */
  listarPendentes(): Observable<PagamentoResponse[]> {
    return this.http
      .get<ApiResponse<PagamentoResponse[]>>(`${this.apiUrl}/meus-pendentes`)
      .pipe(map((response) => response?.data || []));
  }

  /**
   * Notifica o backend sobre confirmação de pagamento (webhook manual)
   */
  notificarPagamento(data: { order_nsu: string; transaction_id?: string; comprovante?: string }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/webhook`, data);
  }

  /**
   * Processa retorno do checkout InfinitePay
   */
  processarRetornoCheckout(params: any): Observable<PagamentoResponse> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/webhook`, params).pipe(
      map(() => {
        // Após processar webhook, buscar status atualizado
        const orderNsu = params['order_nsu'];
        if (orderNsu) {
          // Retornar mock response, o componente já trata o sucesso
          return {
            status: 'PAGO',
            orderNsu
          } as any;
        }
        throw new Error('order_nsu não fornecido');
      })
    );
  }
}
