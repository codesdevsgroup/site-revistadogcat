import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtigosService } from '../../../services/artigos.service';
import type { Artigo } from '../../../interfaces/artigo.interface';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artigos.html',
  styleUrls: ['./artigos.scss']
})
export class ArtigosComponent {
  artigos: Artigo[] = [];
  loading = true;
  error?: string;

  constructor(private artigosService: ArtigosService) {}

  ngOnInit(): void {
    // Busca todos os artigos do backend (admin) - inclui rascunhos, revisão e publicados
    this.artigosService.listarTodosArtigos({ sort: 'dataPublicacao:desc' }).subscribe({
      next: (data) => {
        // Garantir que sempre seja um array válido
        if (Array.isArray(data)) {
          this.artigos = data;
        } else if (data && typeof data === 'object' && 'data' in data) {
          // Se for um objeto com propriedade data (resposta paginada)
          this.artigos = Array.isArray((data as any).data) ? (data as any).data : [];
        } else {
          this.artigos = [];
        }
        this.loading = false;
        console.log('Artigos carregados (admin):', this.artigos);
      },
      error: (err) => {
        console.error('Erro ao carregar artigos', err);
        this.error = 'Não foi possível carregar os artigos. Tente novamente mais tarde.';
        this.artigos = []; // Garantir que seja um array vazio em caso de erro
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'publicado':
        return 'status-publicado';
      case 'rascunho':
        return 'status-rascunho';
      case 'revisao':
        return 'status-revisao';
      default:
        return '';
    }
  }

  getCategoriaClass(categoria: string): string {
    switch (categoria.toLowerCase()) {
      case 'cuidados':
        return 'categoria-cuidados';
      case 'nutrição':
      case 'nutricao':
        return 'categoria-nutricao';
      case 'saúde':
      case 'saude':
        return 'categoria-saude';
      case 'comportamento':
        return 'categoria-comportamento';
      case 'segurança':
      case 'seguranca':
        return 'categoria-seguranca';
      default:
        return 'categoria-default';
    }
  }

  editarArtigo(artigo: Artigo): void {
    console.log('Editar artigo:', artigo);
  }

  excluirArtigo(artigo: Artigo): void {
    // Opcional: integrar com backend
    this.artigosService.excluirArtigo(artigo.id).subscribe({
      next: () => {
        this.artigos = this.artigos.filter(a => a.id !== artigo.id);
      },
      error: (err) => {
        console.error('Erro ao excluir artigo', err);
      }
    });
  }

  alterarDestaque(artigo: Artigo): void {
    const novoDestaque = !artigo.destaque;
    this.artigosService.atualizarParcialArtigo(artigo.id, { destaque: novoDestaque }).subscribe({
      next: (atualizado) => {
        artigo.destaque = atualizado.destaque;
      },
      error: (err) => {
        console.error('Erro ao atualizar destaque', err);
      }
    });
  }

  trackByArtigoId(index: number, artigo: Artigo): string {
    return artigo.id;
  }

  getPublishedCount(): number {
    return this.artigosList.filter(a => a.status === 'publicado').length;
  }

  getFeaturedCount(): number {
    return this.artigosList.filter(a => a.destaque).length;
  }

  getTotalViews(): number {
    return this.artigosList.reduce((total, a) => total + (a.visualizacoes || 0), 0);
  }

  // Garante array para evitar erros quando a resposta não for iterável
  get artigosList(): Artigo[] {
    return Array.isArray(this.artigos) ? this.artigos : [];
  }
}
