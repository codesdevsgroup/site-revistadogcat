import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EdicoesService } from '../../../services/edicoes.service';
import type { Edicao } from '../../../interfaces/edicao';

@Component({
  selector: 'app-admin-edicoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './edicoes.html',
  styleUrl: './edicoes.scss'
})
export class AdminEdicoesComponent implements OnInit {
  edicoes: Edicao[] = [];
  loading = true;
  error?: string;

  constructor(private edicoesService: EdicoesService) {}

  ngOnInit(): void {
    this.edicoesService.listarEdicoes({ limit: 20 }).subscribe({
      next: (data) => {
        this.edicoes = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar edições', err);
        this.error = 'Não foi possível carregar as edições. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  abrirPdf(edicao: Edicao): void {
    if (!edicao.pdfUrl) return;
    window.open(edicao.pdfUrl, '_blank');
  }

  trackByEdicaoId(index: number, edicao: Edicao): string {
    return edicao.id;
  }

  get edicoesList(): Edicao[] {
    return Array.isArray(this.edicoes) ? this.edicoes : [];
  }
}