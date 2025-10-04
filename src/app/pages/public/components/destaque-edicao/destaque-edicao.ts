import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtigosService, Artigo } from '../../../../services/artigos.service';

@Component({
  selector: 'app-destaque-edicao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './destaque-edicao.html',
  styleUrl: './destaque-edicao.scss'
})
export class DestaqueEdicaoComponent implements OnInit {
  artigos: Artigo[] = [];
  loading = true;
  error?: string;

  constructor(private artigosService: ArtigosService) {}

  ngOnInit(): void {
    // Busca os artigos em destaque (público). Caso não haja destaques, pode-se trocar para publicados.
    this.artigosService.listarDestaques(9).subscribe({
      next: (data) => {
        this.artigos = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigos em destaque', err);
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
}
