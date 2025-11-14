import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { EdicoesService } from '../../../../services/edicoes.service';
import { Edicao } from '../../../../interfaces/edicao';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-edicao-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxExtendedPdfViewerModule],
  templateUrl: './edicao-viewer.html',
  styleUrl: './edicao-viewer.scss'
})
export class EdicaoViewerComponent implements OnInit {
  edicao?: Edicao;
  pdfSrc: string = '';
  loading = true;
  error?: string;
  pageViewMode: 'book' | 'single' = 'book';
  initialZoom: string | number = '100%';

  private apiUrl = environment.apiUrl;

  constructor(private route: ActivatedRoute, private edicoesService: EdicoesService) {}

  ngOnInit(): void {
    // Ajusta modo de visualização conforme largura da tela
    this.pageViewMode = (typeof window !== 'undefined' && window.innerWidth < 992) ? 'single' : 'book';

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Edição não encontrada.';
      this.loading = false;
      return;
    }
    this.edicoesService.obterEdicao(id).subscribe({
      next: (e) => {
        this.edicao = e;
        const url = e?.pdfUrl || '';
        this.pdfSrc = url.startsWith('http') ? url : `${this.apiUrl}${url}`;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar edição', err);
        this.error = 'Não foi possível carregar a edição.';
        this.loading = false;
      }
    });
  }
}