import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagamentoService } from '../../../services/pagamento.service';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagamento-retorno',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="retorno-container">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-6">

            <div *ngIf="processando" class="text-center">
              <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Processando...</span>
              </div>
              <h3>Processando seu pagamento...</h3>
              <p class="text-muted">Aguarde enquanto validamos a transação</p>
            </div>

            <div *ngIf="!processando && sucesso" class="card shadow-sm">
              <div class="card-body text-center py-5">
                <i class="fas fa-check-circle text-success mb-3" style="font-size: 5rem;"></i>
                <h2 class="text-success mb-3">Pagamento Confirmado!</h2>
                <p class="lead mb-4">
                  Seu cadastro foi realizado e o pagamento confirmado com sucesso!
                </p>
                <button class="btn btn-success btn-lg" (click)="irParaHome()">
                  <i class="fas fa-home me-2"></i>
                  Voltar para Home
                </button>
              </div>
            </div>

            <div *ngIf="!processando && !sucesso" class="card shadow-sm">
              <div class="card-body text-center py-5">
                <i class="fas fa-exclamation-circle text-warning mb-3" style="font-size: 5rem;"></i>
                <h2 class="text-warning mb-3">Pagamento Pendente</h2>
                <p class="lead mb-4">
                  {{ mensagemErro || 'Não foi possível confirmar o pagamento no momento.' }}
                </p>
                <div class="d-flex gap-3 justify-content-center">
                  <button class="btn btn-outline-primary" (click)="tentarNovamente()">
                    <i class="fas fa-redo  me-2"></i>
                    Tentar Novamente
                  </button>
                  <button class="btn btn-primary" (click)="irParaHome()">
                    <i class="fas fa-home me-2"></i>
                    Voltar para Home
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .retorno-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding-top: 60px;
    }
  `]
})
export class PagamentoRetornoComponent implements OnInit {
  processando = true;
  sucesso = false;
  mensagemErro = '';
  orderNsu = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagamentoService: PagamentoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Captura parâmetros da URL de retorno
    this.route.queryParams.subscribe(params => {
      this.orderNsu = params['order_nsu'] || '';
      this.processarRetorno(params);
    });
  }

  processarRetorno(params: any): void {
    if (!this.orderNsu) {
      this.processando = false;
      this.mensagemErro = 'Dados de retorno inválidos';
      return;
    }

    // Envia dados para o backend processar
    this.pagamentoService.processarRetornoCheckout(params).subscribe({
      next: (resultado) => {
        this.processando = false;

        if (resultado.status === 'PAGO') {
          this.sucesso = true;
          this.notificationService.success('Pagamento confirmado!');
        } else {
          this.sucesso = false;
          this.mensagemErro = 'Pagamento ainda não foi confirmado';
        }
      },
      error: (error) => {
        console.error('Erro ao processar retorno:', error);
        this.processando = false;
        this.sucesso = false;
        this.mensagemErro = 'Erro ao processar pagamento';
        this.notificationService.error('Erro ao processar pagamento');
      }
    });
  }

  tentarNovamente(): void {
    this.router.navigate(['/cadastro-cao']);
  }

  irParaHome(): void {
    this.router.navigate(['/']);
  }
}
