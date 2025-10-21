import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RelatoriosService, FiltrosRelatorio, StatusRelatorio } from '../../services/relatorios.service';
import { NotificationService } from '../../services/notification.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, takeWhile } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-relatorios-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './relatorios-modal.html',
  styleUrls: ['./relatorios-modal.scss']
})
export class RelatoriosModalComponent implements OnInit, OnDestroy {
  @ViewChild('modalElement', { static: true }) modalElement!: ElementRef;
  
  filtrosForm: FormGroup;
  private destroy$ = new Subject<void>();
  private modal: any;
  
  // Estados de carregamento
  exportandoCSV = false;
  exportandoHistorico = false;
  gerandoPDF = false;
  
  // Status do relatório PDF
  statusRelatorio: StatusRelatorio | null = null;
  verificandoStatus = false;

  constructor(
    private fb: FormBuilder,
    private relatoriosService: RelatoriosService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.createForm();
  }

  ngOnInit(): void {
    this.modal = new bootstrap.Modal(this.modalElement.nativeElement);
    this.setDefaultDates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.modal) {
      this.modal.dispose();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      categoria: [''],
      tipoVoto: [''],
      incluirHistorico: [true],
      incluirGraficos: [true],
      incluirFotos: [true]
    });
  }

  private setDefaultDates(): void {
    const hoje = new Date();
    const umMesAtras = new Date();
    umMesAtras.setMonth(hoje.getMonth() - 1);

    this.filtrosForm.patchValue({
      dataInicio: umMesAtras.toISOString().split('T')[0],
      dataFim: hoje.toISOString().split('T')[0]
    });
  }

  /**
   * Abre o modal
   */
  abrir(): void {
    this.modal.show();
  }

  /**
   * Fecha o modal
   */
  fechar(): void {
    this.modal.hide();
    this.resetarStatus();
  }

  /**
   * Reseta status dos relatórios
   */
  private resetarStatus(): void {
    this.statusRelatorio = null;
    this.verificandoStatus = false;
    this.exportandoCSV = false;
    this.exportandoHistorico = false;
    this.gerandoPDF = false;
  }

  /**
   * Obtém filtros do formulário
   */
  private obterFiltros(): FiltrosRelatorio {
    const formValue = this.filtrosForm.value;
    return {
      dataInicio: formValue.dataInicio,
      dataFim: formValue.dataFim,
      categoria: formValue.categoria || undefined,
      tipoVoto: formValue.tipoVoto || undefined,
      incluirHistorico: formValue.incluirHistorico,
      incluirGraficos: formValue.incluirGraficos,
      incluirFotos: formValue.incluirFotos
    };
  }

  /**
   * Valida período selecionado
   */
  private validarPeriodo(): boolean {
    const { dataInicio, dataFim } = this.filtrosForm.value;
    
    if (!dataInicio || !dataFim) {
      this.notificationService.error('Por favor, selecione o período para o relatório.');
      return false;
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const hoje = new Date();

    if (inicio > fim) {
      this.notificationService.error('A data de início deve ser anterior à data de fim.');
      return false;
    }

    if (fim > hoje) {
      this.notificationService.error('A data de fim não pode ser futura.');
      return false;
    }

    // Limite de 1 ano
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(hoje.getFullYear() - 1);
    
    if (inicio < umAnoAtras) {
      this.notificationService.error('O período máximo para relatórios é de 1 ano.');
      return false;
    }

    return true;
  }

  /**
   * Exporta dados em CSV
   */
  exportarCSV(): void {
    if (!this.validarPeriodo()) return;

    this.exportandoCSV = true;
    const filtros = this.obterFiltros();

    this.relatoriosService.exportarCSV(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const filename = this.relatoriosService.gerarNomeArquivo('csv', filtros);
          this.relatoriosService.downloadBlob(blob, filename);
          this.notificationService.success('Exportação CSV concluída com sucesso!');
          this.exportandoCSV = false;
        },
        error: (error) => {
          console.error('Erro ao exportar CSV:', error);
          this.notificationService.error('Erro ao exportar dados em CSV. Tente novamente.');
          this.exportandoCSV = false;
        }
      });
  }

  /**
   * Exporta histórico em CSV
   */
  exportarHistoricoCSV(): void {
    if (!this.validarPeriodo()) return;

    this.exportandoHistorico = true;
    const filtros = this.obterFiltros();

    this.relatoriosService.exportarHistoricoCSV(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const filename = this.relatoriosService.gerarNomeArquivo('historico', filtros);
          this.relatoriosService.downloadBlob(blob, filename);
          this.notificationService.success('Exportação do histórico concluída com sucesso!');
          this.exportandoHistorico = false;
        },
        error: (error) => {
          console.error('Erro ao exportar histórico:', error);
          this.notificationService.error('Erro ao exportar histórico. Tente novamente.');
          this.exportandoHistorico = false;
        }
      });
  }

  /**
   * Gera relatório PDF premium
   */
  gerarRelatorioPDF(): void {
    if (!this.validarPeriodo()) return;

    this.gerandoPDF = true;
    const filtros = this.obterFiltros();

    this.relatoriosService.gerarRelatorioPDF(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.statusRelatorio = response.data;
            this.notificationService.success('Relatório PDF iniciado! Acompanhe o progresso abaixo.');
            this.iniciarVerificacaoStatus();
          } else {
            this.notificationService.error('Erro ao iniciar geração do relatório PDF.');
          }
          this.gerandoPDF = false;
        },
        error: (error) => {
          console.error('Erro ao gerar PDF:', error);
          this.notificationService.error('Erro ao gerar relatório PDF. Tente novamente.');
          this.gerandoPDF = false;
        }
      });
  }

  /**
   * Inicia verificação periódica do status do relatório
   */
  private iniciarVerificacaoStatus(): void {
    if (!this.statusRelatorio) return;

    this.verificandoStatus = true;

    interval(3000) // Verifica a cada 3 segundos
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.relatoriosService.verificarStatusRelatorio(this.statusRelatorio!.relatorioId)),
        takeWhile((response) => {
          if (response.success) {
            this.statusRelatorio = response.data;
            return response.data.status === 'processando' || response.data.status === 'pendente';
          }
          return false;
        }, true)
      )
      .subscribe({
        next: (response) => {
          if (response.success && this.statusRelatorio) {
            if (this.statusRelatorio.status === 'concluido') {
              this.notificationService.success('Relatório PDF gerado com sucesso!');
              this.verificandoStatus = false;
            } else if (this.statusRelatorio.status === 'erro') {
              this.notificationService.error('Erro na geração do relatório PDF.');
              this.verificandoStatus = false;
            }
          }
        },
        error: (error) => {
          console.error('Erro ao verificar status:', error);
          this.verificandoStatus = false;
        }
      });
  }

  /**
   * Faz download do relatório PDF
   */
  downloadPDF(): void {
    if (!this.statusRelatorio?.urlDownload) return;

    const filename = this.statusRelatorio.urlDownload.split('/').pop() || 'relatorio.pdf';
    
    this.relatoriosService.downloadRelatorio(filename)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.relatoriosService.downloadBlob(blob, filename);
          this.notificationService.success('Download do relatório iniciado!');
        },
        error: (error) => {
          console.error('Erro ao fazer download:', error);
          this.notificationService.error('Erro ao fazer download do relatório.');
        }
      });
  }

  /**
   * Obtém classe CSS para status
   */
  getStatusClass(): string {
    if (!this.statusRelatorio) return '';
    
    switch (this.statusRelatorio.status) {
      case 'concluido':
        return 'text-success';
      case 'erro':
        return 'text-danger';
      case 'processando':
        return 'text-warning';
      default:
        return 'text-info';
    }
  }

  /**
   * Obtém texto do status
   */
  getStatusText(): string {
    if (!this.statusRelatorio) return '';
    
    switch (this.statusRelatorio.status) {
      case 'pendente':
        return 'Aguardando processamento...';
      case 'processando':
        return `Processando... (${this.statusRelatorio.progresso || 0}%)`;
      case 'concluido':
        return 'Relatório pronto para download!';
      case 'erro':
        return 'Erro na geração do relatório';
      case 'expirado':
        return 'Relatório expirado';
      default:
        return 'Status desconhecido';
    }
  }
}