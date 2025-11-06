import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { VotacaoService } from '../../../../services/votacao.service';
import { VotacaoPublicListResponse, VotoItem, VotoTipo } from '../../../../interfaces/votacao.interface';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-admin-votacao-auditoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auditoria.html',
  styleUrls: ['./auditoria.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminVotacaoAuditoriaComponent implements OnInit {
  filtrosForm: FormGroup;
  carregando = signal(false);
  page = signal(1);
  limit = signal(20);
  totalPages = signal(1);
  data = signal<VotacaoPublicListResponse | null>(null);

  tipos: Array<{ label: string; value: '' | VotoTipo }> = [
    { label: 'Todos', value: '' },
    { label: 'Comum', value: 'COMUM' },
    { label: 'Super', value: 'SUPER' }
  ];

  constructor(
    private fb: FormBuilder,
    private votacaoService: VotacaoService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      userId: [''],
      cadastroId: [''],
      tipo: [''],
      dataInicial: [''],
      dataFinal: [''],
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    const filtros = this.buildFilters();
    this.votacaoService.listarPublico(this.page(), this.limit(), filtros).subscribe({
      next: (resp) => {
        this.data.set(resp);
        this.totalPages.set(resp.totalPages || 1);
        this.carregando.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar auditoria de votos:', error);
        this.notificationService.error('Não foi possível carregar os registros de votos.');
        this.carregando.set(false);
      }
    });
  }

  private buildFilters(): { userId?: string; cadastroId?: string; tipo?: VotoTipo; dataInicial?: string; dataFinal?: string } {
    const v = this.filtrosForm.value;
    return {
      userId: v.userId || undefined,
      cadastroId: v.cadastroId || undefined,
      tipo: v.tipo || undefined,
      dataInicial: v.dataInicial || undefined,
      dataFinal: v.dataFinal || undefined,
    };
  }

  aplicarFiltros(): void {
    this.page.set(1);
    this.carregar();
  }

  limparFiltros(): void {
    this.filtrosForm.reset({ tipo: '' });
    this.page.set(1);
    this.carregar();
  }

  anterior(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.carregar();
    }
  }

  proximo(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.carregar();
    }
  }

  trackByVoto(_: number, item: VotoItem): string {
    return item.votoId;
  }
}