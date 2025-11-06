import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtigosService, Artigo } from '../../../../services/artigos.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-artigos-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artigos-lista.html',
  styleUrl: './artigos-lista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtigosListaComponent implements OnInit {
  private artigosService = inject(ArtigosService);

  artigos: Artigo[] = [];
  loading = false;
  error: string | null = null;
  public apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.carregarArtigos();
  }

  carregarArtigos(): void {
    this.loading = true;
    this.error = null;
    // Lista artigos publicados com ordenação por data de publicação desc
    this.artigosService.listarPublicados(12, 1, 'dataPublicacao:desc').subscribe({
      next: (data) => {
        this.artigos = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigos publicados:', err);
        this.error = 'Não foi possível carregar os artigos. Tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  trackById(index: number, item: Artigo): string {
    return item.id;
  }

  // Constrói a URL da imagem a partir do filename retornado pela API
  getImagemUrl(filename?: string): string {
    if (!filename) return './public/dog/default-article.svg';
    return `${this.apiUrl}/artigos/imagem/${filename}`;
  }
}