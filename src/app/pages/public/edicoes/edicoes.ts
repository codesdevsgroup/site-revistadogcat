import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Edicao = {
  id: string;
  titulo: string;
  bimestre: string;
  ano: number;
  pdfUrl?: string;
};

@Component({
  selector: 'app-edicoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edicoes.html',
  styleUrl: './edicoes.scss'
})
export class EdicoesComponent {
  edicoes: Edicao[] = [
    { id: '2026-01', titulo: 'Edição Jan/Fev', bimestre: 'Jan/Fev', ano: 2026 },
    { id: '2026-02', titulo: 'Edição Mar/Abr', bimestre: 'Mar/Abr', ano: 2026 },
    { id: '2026-03', titulo: 'Edição Mai/Jun', bimestre: 'Mai/Jun', ano: 2026 },
    { id: '2026-04', titulo: 'Edição Jul/Ago', bimestre: 'Jul/Ago', ano: 2026 },
    { id: '2026-05', titulo: 'Edição Set/Out', bimestre: 'Set/Out', ano: 2026 },
    { id: '2026-06', titulo: 'Edição Nov/Dez', bimestre: 'Nov/Dez', ano: 2026 }
  ];

  showModal = false;
  currentPdfUrl: string | null = null;

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
