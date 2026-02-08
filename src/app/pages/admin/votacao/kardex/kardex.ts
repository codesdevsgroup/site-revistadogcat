import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { KardexService } from '../../../../services/kardex.service';
import { KardexItem, AcaoKardex, ListKardexDto } from '../../../../interfaces/kardex.interface';
import { VotoTipo } from '../../../../interfaces/votacao.interface';

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
  kardexItems: KardexItem[] = [];
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;

  acoes = Object.values(AcaoKardex);
  tiposVoto: VotoTipo[] = ['COMUM', 'SUPER'];

  constructor(
    private fb: FormBuilder,
    private kardexService: KardexService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.filtrosForm = this.fb.group({
      dataInicio: [''],
      dataFim: [''],
      acao: [''],
      tipo: [''],
      userId: [''],
      cadastroId: [''],
      ip: ['']
    });
  }

  ngOnInit(): void {
    // Definir datas padrão? Talvez não seja necessário forçar, mas pode ser útil.
    // this.setDefaultDates();
    this.consultar();
  }

  consultar(page: number = 1): void {
    this.carregando = true;
    this.page = page;

    const filters: ListKardexDto = {
      page: this.page,
      limit: this.limit,
      ...this.filtrosForm.value
    };

    // Remove empty values
    Object.keys(filters).forEach(key => {
      const k = key as keyof ListKardexDto;
      if (filters[k] === '' || filters[k] === null) {
        delete filters[k];
      }
    });

    this.kardexService.listar(filters).subscribe({
      next: (resp) => {
        this.kardexItems = resp.kardex;
        this.total = resp.total;
        this.totalPages = resp.totalPages;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao obter Kardex:', error);
        this.notificationService.error('Não foi possível carregar o Kardex. Tente novamente.');
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  exportar(): void {
    const filters: ListKardexDto = {
      ...this.filtrosForm.value
    };

     // Remove empty values
    Object.keys(filters).forEach(key => {
      const k = key as keyof ListKardexDto;
      if (filters[k] === '' || filters[k] === null) {
        delete filters[k];
      }
    });

    this.kardexService.exportar(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kardex-export-${new Date().toISOString()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao exportar:', err);
        this.notificationService.error('Erro ao exportar dados.');
      }
    });
  }

  limparFiltros(): void {
    this.filtrosForm.reset();
    this.consultar();
  }

  trackById(_: number, item: KardexItem): string {
    return item.kardexId;
  }

  getPagesArray(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
