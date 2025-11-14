import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { RouterModule } from '@angular/router';
import { Edicao } from '../../../interfaces/edicao';
import { environment } from '../../../../environments/environment';
import { EdicoesService } from '../../../services/edicoes.service';

@Component({
  selector: 'app-edicoes',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxExtendedPdfViewerModule],
  templateUrl: './edicoes.html',
  styleUrl: './edicoes.scss'
})
export class EdicoesComponent implements OnInit {
  edicoes: Edicao[] = [];
  loading = true;
  error?: string;

  showModal = false;
  currentPdfUrl: string | null = null;
  public apiUrl = environment.apiUrl;

  constructor(private edicoesService: EdicoesService) {}

  ngOnInit(): void {
    this.edicoesService.listarEdicoes({ limit: 12 }).subscribe({
      next: (data) => {
        this.edicoes = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar edições', err);
        this.error = 'Não foi possível carregar as edições. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  abrirPdf(edicao: Edicao) {
    if (!edicao.pdfUrl) {
      return;
    }
    const url = edicao.pdfUrl;
    this.currentPdfUrl = url.startsWith('http') ? url : `${this.apiUrl}${url}`;
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
    this.currentPdfUrl = null;
  }

  // Abre um PDF a partir de uma URL direta (usado pelo card de demonstração)
  abrirPdfUrl(url: string) {
    if (!url) return;
    this.currentPdfUrl = url;
    this.showModal = true;
  }

  // Protege o *ngFor contra valores não iteráveis vindos do backend
  get edicoesList(): Edicao[] {
    return Array.isArray(this.edicoes) ? this.edicoes : [];
  }

  formatarData(data: Date | string): string {
    if (!data) return '-';
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
