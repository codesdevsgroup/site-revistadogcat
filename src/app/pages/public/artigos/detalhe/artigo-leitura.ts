import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ArtigosService } from "../../../../services/artigos.service";
import type { Artigo } from "../../../../interfaces/artigo.interface";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-artigo-leitura",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./artigo-leitura.html",
  styleUrls: ["./artigo-leitura.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtigoLeituraComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private artigosService = inject(ArtigosService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  artigo?: Artigo;
  conteudoSeguro?: SafeHtml;
  loading = true;
  error: string | null = null;

  // Sistema de curtidas e visualizações
  curtido = false;
  totalCurtidas = 0;
  totalVisualizacoes = 0;
  processandoCurtida = false;

  private destroy$ = new Subject<void>();

  private markForCheckSafe(): void {
    const anyCdr: any = this.cdr as any;
    if (anyCdr && anyCdr.destroyed) return;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      this.error = "Artigo não encontrado.";
      this.loading = false;
      return;
    }
    this.carregarArtigo(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega o artigo e suas estatísticas
   */
  private carregarArtigo(id: string): void {
    this.artigosService
      .obterArtigo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (art) => {
          this.artigo = art;
          this.conteudoSeguro = this.sanitizer.bypassSecurityTrustHtml(
            this.extractHtmlFromContent(art.conteudo),
          );
          this.totalCurtidas = art.curtidas || 0;
          this.totalVisualizacoes = art.visualizacoes || 0;
          this.loading = false;
          this.markForCheckSafe();

          // Registrar visualização
          this.registrarVisualizacao(id);

          // Verificar se já curtiu
          this.verificarCurtida(id);
        },
        error: (err) => {
          console.error("Erro ao carregar artigo:", err);
          this.error =
            "Não foi possível carregar o artigo. Tente novamente mais tarde.";
          this.loading = false;
          this.markForCheckSafe();
        },
      });
  }

  /**
   * Registra a visualização do artigo
   */
  private registrarVisualizacao(artigoId: string): void {
    this.artigosService
      .registrarVisualizacao(artigoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.totalVisualizacoes = result.totalViews;
          this.markForCheckSafe();
        },
        error: (err) => {
          console.warn("Erro ao registrar visualização:", err);
        },
      });
  }

  /**
   * Verifica se o usuário já curtiu o artigo
   */
  private verificarCurtida(artigoId: string): void {
    this.artigosService
      .verificarCurtida(artigoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curtido) => {
          this.curtido = curtido;
          this.markForCheckSafe();
        },
        error: (err) => {
          console.warn("Erro ao verificar curtida:", err);
        },
      });
  }

  /**
   * Toggle curtida no artigo
   */
  toggleCurtida(): void {
    if (!this.artigo || this.processandoCurtida) {
      return;
    }

    this.processandoCurtida = true;

    this.artigosService
      .toggleCurtida(this.artigo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.curtido = result.curtido;
          this.totalCurtidas = result.totalCurtidas;
          this.processandoCurtida = false;
          this.markForCheckSafe();
        },
        error: (err) => {
          console.error("Erro ao curtir artigo:", err);
          this.processandoCurtida = false;
          this.markForCheckSafe();
        },
      });
  }

  // Extrai HTML de um conteúdo que pode ser string ou objeto (ex.: TipTap/JSON)
  private extractHtmlFromContent(content: any): string {
    try {
      if (!content) return "";
      if (typeof content === "string") return content;
      // Se for objeto e possuir campo html, usa-o diretamente
      if (typeof content === "object") {
        if ("html" in content && typeof content.html === "string") {
          return content.html as string;
        }
        // Caso contrário, tenta converter minimamente parágrafos
        if ("content" in content && Array.isArray(content.content)) {
          const parts = content.content
            .map(
              (node: any) =>
                node?.text ||
                node?.content?.map((n: any) => n.text).join(" ") ||
                "",
            )
            .filter(Boolean);
          return `<p>${parts.join("</p><p>")}</p>`;
        }
      }
      return "";
    } catch (e) {
      console.warn("Falha ao extrair HTML do conteúdo:", e);
      return "";
    }
  }
}
