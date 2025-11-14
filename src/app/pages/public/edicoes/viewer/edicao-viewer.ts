import { Component, OnInit, HostListener } from '@angular/core';
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
  isMobile = false;
  showMobileHint = false;
  currentPage = 1;
  totalPages = 0;

  private apiUrl = environment.apiUrl;

  constructor(private route: ActivatedRoute, private edicoesService: EdicoesService) {}

  ngOnInit(): void {
    this.updateModeByViewport();

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
        this.showMobileHint = this.isMobile;
      },
      error: (err) => {
        console.error('Erro ao carregar edição', err);
        this.error = 'Não foi possível carregar a edição.';
        this.loading = false;
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateModeByViewport();
  }

  @HostListener('window:orientationchange')
  onOrientation() {
    this.updateModeByViewport();
  }

  toggleViewMode() {
    this.pageViewMode = this.pageViewMode === 'book' ? 'single' : 'book';
  }

  private updateModeByViewport() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    this.isMobile = w < 576;
    this.pageViewMode = w < 992 ? 'single' : 'book';
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
  }

  onPagesLoaded(evt: any) {
    if (evt && typeof evt.pagesCount === 'number') {
      this.totalPages = evt.pagesCount;
    } else if (typeof evt === 'number') {
      this.totalPages = evt;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
    }
  }

  nextPage() {
    const max = this.totalPages || Number.MAX_SAFE_INTEGER;
    if (this.currentPage < max) {
      this.currentPage = this.currentPage + 1;
    }
  }

  dismissHint() {
    this.showMobileHint = false;
  }
}