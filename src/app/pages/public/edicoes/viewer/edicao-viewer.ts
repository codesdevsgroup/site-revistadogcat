import { Component, OnInit, HostListener, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
export class EdicaoViewerComponent implements OnInit, AfterViewInit {
  edicao?: Edicao;
  pdfSrc: string = '';
  loading = true;
  error?: string;
  pageViewMode: 'book' | 'single' = 'book';
  initialZoom: string | number = '100%';
  computedZoom: string | number = '100%';
  viewerHeight: string = '100%';
  isMobile = false;
  showMobileHint = false;
  currentPage = 1;
  totalPages = 0;
  @ViewChild('toolbar') toolbarRef?: ElementRef<HTMLDivElement>;

  private apiUrl = environment.apiUrl;

  constructor(private route: ActivatedRoute, private edicoesService: EdicoesService) {}

  ngOnInit(): void {
    this.updateModeByViewport();
    this.updateZoomByViewport();

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
    this.updateZoomByViewport();
    this.updateViewerHeight();
  }

  @HostListener('window:orientationchange')
  onOrientation() {
    this.updateModeByViewport();
    this.updateZoomByViewport();
    this.updateViewerHeight();
  }

  toggleViewMode() {
    this.pageViewMode = this.pageViewMode === 'book' ? 'single' : 'book';
  }

  private updateModeByViewport() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    this.isMobile = w < 576;
    this.pageViewMode = w < 992 ? 'single' : 'book';
  }

  private updateZoomByViewport() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    if (w >= 1366) {
      this.computedZoom = 'page-fit';
    } else if (w >= 992) {
      this.computedZoom = 'page-width';
    } else {
      this.computedZoom = '100%';
    }
  }

  private updateViewerHeight() {
    const rootH = document.documentElement?.clientHeight || window.innerHeight;
    const navEl = document.querySelector('.navbar') as HTMLElement | null;
    const navH = navEl?.offsetHeight || 0;
    const toolbarH = this.isMobile ? (this.toolbarRef?.nativeElement?.offsetHeight || 0) : 0;
    const containerEl = document.querySelector('.viewer-container') as HTMLElement | null;
    const styles = containerEl ? getComputedStyle(containerEl) : undefined;
    const paddingTop = styles ? parseFloat(styles.paddingTop) : 0;
    const paddingBottom = styles ? parseFloat(styles.paddingBottom) : -18;
    const totalPadding = (paddingTop + paddingBottom) || 0;
    const h = Math.max(300, Math.ceil(rootH - navH - toolbarH - totalPadding));
    this.viewerHeight = `${h}px`;
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

  ngAfterViewInit(): void {
    this.updateViewerHeight();
  }

  private getZoomPercent(): number {
    if (typeof this.computedZoom === 'number') {
      return this.computedZoom;
    }
    if (typeof this.computedZoom === 'string') {
      const m = this.computedZoom.match(/(\d+)%/);
      if (m) return parseInt(m[1], 10);
    }
    return 100;
  }

  zoomIn() {
    const current = this.getZoomPercent();
    const next = Math.min(300, current + 10);
    this.computedZoom = `${next}%`;
  }

  zoomOut() {
    const current = this.getZoomPercent();
    const next = Math.max(25, current - 10);
    this.computedZoom = `${next}%`;
  }
}
