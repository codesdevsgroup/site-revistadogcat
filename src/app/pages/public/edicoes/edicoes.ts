import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Edicao } from '../../../interfaces/edicao';
import { EdicoesService } from '../../../services/edicoes.service';

@Component({
  selector: 'app-edicoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edicoes.html',
  styleUrl: './edicoes.scss'
})
export class EdicoesComponent implements OnInit {
  edicoes: Edicao[] = [];
  loading = true;
  error?: string;

  showModal = false;
  currentPdfUrl: string | null = null;

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
    this.currentPdfUrl = edicao.pdfUrl;
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
    this.currentPdfUrl = null;
  }
}
