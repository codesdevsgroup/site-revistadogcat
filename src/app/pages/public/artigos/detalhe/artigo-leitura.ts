import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ArtigosService } from "../../../../services/artigos.service";
import type { Artigo } from "../../../../interfaces/artigo.interface";

@Component({
  selector: "app-artigo-leitura",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./artigo-leitura.html",
  styleUrl: "./artigo-leitura.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtigoLeituraComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private artigosService = inject(ArtigosService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  artigo?: Artigo;
  conteudoSeguro?: SafeHtml;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      this.error = "Artigo não encontrado.";
      this.loading = false;
      return;
    }
    this.artigosService.obterArtigo(id).subscribe({
      next: (art) => {
        this.artigo = art;
        this.conteudoSeguro = this.sanitizer.bypassSecurityTrustHtml(
          this.extractHtmlFromContent(art.conteudo),
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Erro ao carregar artigo:", err);
        this.error =
          "Não foi possível carregar o artigo. Tente novamente mais tarde.";
        this.loading = false;
        this.cdr.markForCheck();
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
