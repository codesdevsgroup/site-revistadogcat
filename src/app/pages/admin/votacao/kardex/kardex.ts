import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RelatoriosService, KardexRelatorio } from '../../../../services/relatorios.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-admin-votacao-kardex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './kardex.html',
  styleUrls: ['./kardex.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminVotacaoKardexComponent implements OnInit {
  filtrosForm: FormGroup;
  carregando = false;
  relatorio: KardexRelatorio | null = null;

  constructor(
    private fb: FormBuilder,
    private relatoriosService: RelatoriosService,
    private notificationService: NotificationService
  ) {
    this.filtrosForm = this.fb.group({
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setDefaultDates();
    this.consultar();
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

  consultar(): void {
    if (this.filtrosForm.invalid) {
      this.notificationService.warning('Selecione o período para consultar o Kardex.');
      return;
    }

    const { dataInicio, dataFim } = this.filtrosForm.value;
    this.carregando = true;
    this.relatoriosService.obterRelatorioKardex({ dataInicio, dataFim }).subscribe({
      next: (resp) => {
        this.relatorio = resp.data;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao obter Kardex:', error);
        this.notificationService.error('Não foi possível carregar o Kardex. Tente novamente.');
        this.carregando = false;
      }
    });
  }

  trackByRanking(_: number, item: { posicao: number; cao: { id: string; nome: string }; totalPontos: number; totalVotos: number; }): string {
    return `${item.cao.id}-${item.posicao}`;
  }
}