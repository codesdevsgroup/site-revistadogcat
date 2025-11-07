import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ArtigosService } from "../../../../services/artigos.service";
import type { Artigo } from "../../../../interfaces/artigo.interface";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-artigos-lista",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./artigos-lista.html",
  styleUrl: "./artigos-lista.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtigosListaComponent implements OnInit {
  private artigosService = inject(ArtigosService);
  private cdr = inject(ChangeDetectorRef);

  artigos: Artigo[] = [];
  categorias: string[] = [];
  categoriaSelecionada: string | null = null;
  loading = false;
  error: string | null = null;
  public apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.carregarArtigos();
    this.carregarCategorias();
  }

  carregarArtigos(): void {
    this.loading = true;
    this.error = null;

    const filtros = {
      sort: "dataPublicacao:desc",
      categoria: this.categoriaSelecionada || undefined,
    };

    this.artigosService
      .listarPublicados(12, 1, filtros.sort, filtros.categoria)
      .subscribe({
        next: (data) => {
          this.artigos = Array.isArray(data) ? data : [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Erro ao carregar artigos:", err);
          this.error = "Não foi possível carregar os artigos. Tente novamente mais tarde.";
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  carregarCategorias(): void {
    this.artigosService.listarCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Erro ao carregar categorias:", err);
      }
    });
  }

  onCategoryFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.categoriaSelecionada = selectElement.value || null;
    this.carregarArtigos();
  }

  limparFiltro(): void {
    this.categoriaSelecionada = null;
    const selectElement = document.getElementById('category-filter') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = "";
    }
    this.carregarArtigos();
  }

  trackById(index: number, item: Artigo): string {
    return item.id;
  }

  // Constrói a URL da imagem a partir do filename retornado pela API
  getImagemUrl(filename?: string): string {
    // Usa mesma imagem padrão do componente de destaque da homepage para consistência visual
    if (!filename) return "./dog/default-article.svg";
    return `${this.apiUrl}/artigos/imagem/${filename}`;
  }
}