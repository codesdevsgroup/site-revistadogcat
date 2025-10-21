import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtigosService, Artigo } from '../../../../services/artigos.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artigos.html',
  styleUrl: './artigos.scss'
})
export class ArtigosComponent implements OnInit {
  artigos: Artigo[] = [];
  loading = true;
  error?: string;
  public apiUrl = environment.apiUrl;

  constructor(private artigosService: ArtigosService) {}

  ngOnInit(): void {
    this.loading = true;
    this.artigosService.listarArtigosHomepage().subscribe({
      next: (artigos) => {
        this.artigos = artigos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar artigos:', error);
        this.error = 'Não foi possível carregar os artigos. Tente novamente mais tarde.';
        this.loading = false;
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
}
