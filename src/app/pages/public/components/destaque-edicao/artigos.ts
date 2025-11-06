import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtigosService } from '../../../../services/artigos.service';
import type { Artigo } from '../../../../interfaces/artigo.interface';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artigos.html',
  styleUrl: './artigos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtigosComponent implements OnInit {
  artigos: Artigo[] = [];
  loading = true;
  error?: string;
  public apiUrl = environment.apiUrl;
  featuredArtigo?: Artigo;
  categories: string[] = [];
  activeCategory: string = 'Todos';
  tituloSecao: string = 'Novidades da Revista';
  subtituloSecao: string = 'Leituras recentes e recomendações sobre cães e gatos.';

  constructor(private artigosService: ArtigosService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.artigosService.listarArtigosHomepage().subscribe({
      next: (artigos) => {
        this.artigos = artigos;
        this.featuredArtigo = artigos.find(a => a.destaque);
        const uniqueCats = Array.from(new Set(artigos.map(a => a.categoria).filter(Boolean)));
        this.categories = uniqueCats.sort((a, b) => a.localeCompare(b, 'pt-BR'));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar artigos:', error);
        this.error = 'Não foi possível carregar os artigos. Tente novamente mais tarde.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackById(index: number, item: Artigo) {
    return item.id ?? index;
  }

  resumoCurto(resumo?: string): string {
    if (!resumo) return '';
    const max = 160;
    return resumo.length > max ? resumo.slice(0, max) + '…' : resumo;
  }

  getImagemUrl(imagemCapa: string): string {
    if (!imagemCapa) {
      return './dog/default-article.svg';
    }
    const filename = imagemCapa.split('/').pop();
    return `${this.apiUrl}/artigos/imagem/${filename}`;
  }

  get artigosFiltrados(): Artigo[] {
    if (this.activeCategory === 'Todos') return this.artigos;
    return this.artigos.filter(a => a.categoria === this.activeCategory);
  }

  selecionarCategoria(cat: string): void {
    this.activeCategory = cat;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = '/dog/default-article.svg';
    }
  }
}
