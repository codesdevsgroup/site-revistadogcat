import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { environment } from '../../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/pagamento`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('criarPagamento', () => {
    it('deve criar um link de pagamento e retornar os dados', () => {
      const mockCadastroId = '123';
      const mockResponse = {
        data: { pagamentoId: 'p1', status: 'PENDENTE' }
      };

      service.criarPagamento(mockCadastroId).subscribe(response => {
        expect(response).toEqual(mockResponse.data as any);
      });

      const req = httpMock.expectOne(`${apiUrl}/criar-link/${mockCadastroId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('deve retornar a resposta completa se o campo data estiver ausente (fallback)', () => {
      const mockCadastroId = '123';
      const mockResponse = { pagamentoId: 'p1', status: 'PENDENTE' };

      service.criarPagamento(mockCadastroId).subscribe(response => {
        expect(response).toEqual(mockResponse as any);
      });

      const req = httpMock.expectOne(`${apiUrl}/criar-link/${mockCadastroId}`);
      req.flush(mockResponse);
    });
  });

  describe('consultarStatusPorCadastro', () => {
    it('deve retornar o status do pagamento por cadastroId', () => {
      const mockCadastroId = '123';
      const mockResponse = {
        data: { pagamentoId: 'p1', status: 'PAGO' }
      };

      service.consultarStatusPorCadastro(mockCadastroId).subscribe(response => {
        expect(response).toEqual(mockResponse.data as any);
      });

      const req = httpMock.expectOne(`${apiUrl}/cadastro/${mockCadastroId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve retornar null se o campo data estiver ausente', () => {
      const mockCadastroId = '123';
      const mockResponse = {};

      service.consultarStatusPorCadastro(mockCadastroId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/cadastro/${mockCadastroId}`);
      req.flush(mockResponse);
    });
  });

  describe('buscarPagamento', () => {
    it('deve buscar um pagamento por ID', () => {
      const mockPagamentoId = 'p1';
      const mockResponse = {
        data: { pagamentoId: 'p1', status: 'PENDENTE' }
      };

      service.buscarPagamento(mockPagamentoId).subscribe(response => {
        expect(response).toEqual(mockResponse.data as any);
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockPagamentoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve retornar a resposta completa se o campo data estiver ausente (fallback)', () => {
      const mockPagamentoId = 'p1';
      const mockResponse = { pagamentoId: 'p1', status: 'PENDENTE' };

      service.buscarPagamento(mockPagamentoId).subscribe(response => {
        expect(response).toEqual(mockResponse as any);
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockPagamentoId}`);
      req.flush(mockResponse);
    });
  });

  describe('listarPendentes', () => {
    it('deve listar pagamentos pendentes', () => {
      const mockResponse = {
        data: [{ pagamentoId: 'p1', status: 'PENDENTE' }]
      };

      service.listarPendentes().subscribe(response => {
        expect(response).toEqual(mockResponse.data as any);
      });

      const req = httpMock.expectOne(`${apiUrl}/meus-pendentes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve retornar array vazio se o campo data estiver ausente', () => {
      const mockResponse = {};

      service.listarPendentes().subscribe(response => {
        expect(response).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiUrl}/meus-pendentes`);
      req.flush(mockResponse);
    });
  });

  describe('notificarPagamento', () => {
    it('deve enviar notificação de pagamento', () => {
      const mockData = { order_nsu: 'nsu123', transaction_id: 't1', comprovante: 'c1' };
      const mockResponse = { success: true };

      service.notificarPagamento(mockData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/webhook`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockResponse);
    });
  });

  describe('processarRetornoCheckout', () => {
    it('deve processar o retorno do checkout e retornar status PAGO quando order_nsu está presente', () => {
      const mockParams = { order_nsu: 'nsu123' };
      const mockResponse = { success: true };

      service.processarRetornoCheckout(mockParams).subscribe(response => {
        expect(response.status).toBe('PAGO');
        expect(response.orderNsu).toBe('nsu123');
      });

      const req = httpMock.expectOne(`${apiUrl}/webhook`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockParams);
      req.flush(mockResponse);
    });

    it('deve lançar erro quando order_nsu não é fornecido', () => {
      const mockParams = {};
      const mockResponse = { success: true };

      service.processarRetornoCheckout(mockParams).subscribe({
        next: () => fail('Deveria ter lançado erro'),
        error: (error) => {
          expect(error.message).toBe('order_nsu não fornecido');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/webhook`);
      req.flush(mockResponse);
    });
  });
});
