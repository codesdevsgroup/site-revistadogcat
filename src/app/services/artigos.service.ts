import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, forkJoin, throwError } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { FingerprintService } from "./fingerprint.service";
import type {
  ArtigoResponseDto,
  Artigo,
  ArtigoInput,
  ArtigoFiltros,
  ArtigosListResponseDto,
} from "../interfaces/artigo.interface";

@Injectable({
  providedIn: "root",
})
export class ArtigosService {
  private readonly apiUrl = `${environment.apiUrl}/artigos`;
  private fingerprintService = inject(FingerprintService);

  constructor(private http: HttpClient) {}
  private mapArtigoFromApi(apiArtigo: ArtigoResponseDto): Artigo {
    console.log("=== MAPEAMENTO DO ARTIGO (público) ===");
    console.log("ArtigoResponseDto recebido:", apiArtigo);
    console.log("Autor presente?", !!(apiArtigo as any)?.autor);

    const autorObj: any = (apiArtigo as any)?.autor || null;

    const artigo: Artigo = {
      id: (apiArtigo as any).artigoId || (apiArtigo as any).id || "",
      titulo: apiArtigo.titulo,
      conteudo: apiArtigo.conteudo,
      resumo: this.truncateResumo(apiArtigo.resumo),
      autor: autorObj?.name ?? "Autor desconhecido",
      autorId: autorObj?.userId ?? "",
      categoria: apiArtigo.categoria,
      status: this.mapStatusFromApi(apiArtigo.status),
      dataPublicacao: apiArtigo.dataPublicacao,
      imagemCapa: apiArtigo.imagemCapa || "",
      visualizacoes: Number(apiArtigo.visualizacoes ?? 0),
      curtidas: Number(apiArtigo.curtidas ?? 0),
      comentarios: Array.isArray(apiArtigo.comentarios)
        ? apiArtigo.comentarios.length
        : 0,
      destaque: Boolean(apiArtigo.destaque),
      tags: apiArtigo.tags,
      createdAt: apiArtigo.createdAt,
      updatedAt: apiArtigo.updatedAt,
    };

    console.log("✅ Artigo mapeado com sucesso (resiliente):", artigo);
    return artigo;
  }

  private truncateResumo(resumo?: string, maxLength = 150): string {
    if (!resumo) {
      return "";
    }
    if (resumo.length <= maxLength) {
      return resumo;
    }
    return resumo.substring(0, maxLength) + "...";
  }

  private mapStatusFromApi(
    status: string,
  ): "publicado" | "rascunho" | "revisao" {
    switch (status.toLowerCase()) {
      case "publicado":
        return "publicado";
      case "rascunho":
        return "rascunho";
      case "revisao":
        return "revisao";
      default:
        return "rascunho";
    }
  }

  listarTodosArtigos(filtros?: ArtigoFiltros): Observable<Artigo[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.q) params = params.set("search", filtros.q); // API usa 'search' não 'q'
      if (filtros.categoria)
        params = params.set("categoria", filtros.categoria);
      if (filtros.status) params = params.set("status", filtros.status);
      if (filtros.sort) {
        const [sortBy, sortOrder] = filtros.sort.split(":");
        params = params.set("sortBy", sortBy);
        params = params.set("sortOrder", sortOrder || "desc");
      }
    }

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map((resp) => {
        console.log("Resposta da API (admin):", resp);

        const responseData = resp?.data;

        if (!responseData || !responseData.data) {
          console.error("Resposta da API não contém dados válidos:", resp);
          return [];
        }

        if (!Array.isArray(responseData.data)) {
          console.error("responseData.data não é um array:", responseData.data);
          return [];
        }

        return responseData.data.map((artigo: ArtigoResponseDto) =>
          this.mapArtigoFromApi(artigo)
        );
      }),
    );
  }

  listarArtigos(filtros?: ArtigoFiltros): Observable<Artigo[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.q) params = params.set("search", filtros.q);
      if (filtros.categoria)
        params = params.set("categoria", filtros.categoria);
      if (filtros.status) params = params.set("status", filtros.status);
      if (filtros.sort) {
        const [sortBy, sortOrder] = filtros.sort.split(":");
        params = params.set("sortBy", sortBy);
        params = params.set("sortOrder", sortOrder || "desc");
      }
    }

    return this.http.get<any>(`${this.apiUrl}/publicados`, { params }).pipe(
      map((resp) => {
        console.log("Resposta da API:", resp);

        const responseData = resp?.data;

        if (!responseData || !responseData.data) {
          console.error("Resposta da API não contém dados válidos:", resp);
          return [];
        }

        if (!Array.isArray(responseData.data)) {
          console.error("responseData.data não é um array:", responseData.data);
          return [];
        }

        return responseData.data.map((artigo: ArtigoResponseDto) =>
          this.mapArtigoFromApi(artigo)
        );
      }),
    );
  }

  listarArtigosParaHomepage(limit = 9): Observable<Artigo[]> {
    let params = new HttpParams().set("limit", limit);
    return this.http
      .get<any>(`${this.apiUrl}/artigos-homepage`, { params })
      .pipe(
        map((resp) => {
          console.log("Resposta da API (artigos homepage):", resp);

          const artigos = resp?.data;

          if (!artigos) {
            console.error("Resposta da API não contém dados válidos:", resp);
            return [];
          }

          if (!Array.isArray(artigos)) {
            console.error("resp.data não é um array:", artigos);
            return [];
          }

          return artigos.map((artigo: ArtigoResponseDto) =>
            this.mapArtigoFromApi(artigo),
          );
        }),
      );
  }

  /**
   * Lista artigos para a homepage: primeiro destaques por data mais recente, depois mais novos
   * Máximo de 9 artigos total
   */
  listarArtigosHomepage(): Observable<Artigo[]> {
    // Buscar artigos para homepage e artigos recentes em paralelo
    // Torna cada chamada resiliente: se uma falhar, continua com a outra
    return forkJoin({
      artigosHomepage: this.listarArtigosParaHomepage(9).pipe(
        catchError((err) => {
          console.error("Falha ao carregar artigos da homepage:", err);
          return [] as unknown as Observable<Artigo[]>; // será tratado abaixo
        }),
      ),
      recentes: this.listarArtigos({ sort: "dataPublicacao:desc" }).pipe(
        catchError((err) => {
          console.error("Falha ao carregar artigos recentes:", err);
          return [] as unknown as Observable<Artigo[]>; // será tratado abaixo
        }),
      ),
    }).pipe(
      map(({ artigosHomepage, recentes }) => {
        // Normaliza em caso de erro tratado acima
        const homepage = Array.isArray(artigosHomepage) ? artigosHomepage : [];
        const recents = Array.isArray(recentes) ? recentes : [];
        // Criar um Set com IDs dos artigos da homepage para evitar duplicatas
        const artigosHomepageIds = new Set(homepage.map((artigo) => artigo.id));

        // Filtrar artigos recentes que não estão na homepage
        const recentesNaoHomepage = recents.filter(
          (artigo) => !artigosHomepageIds.has(artigo.id),
        );

        // Combinar: primeiro artigos da homepage ordenados por data, depois recentes
        const artigosOrdenados = [
          ...homepage.sort(
            (a, b) =>
              new Date(b.dataPublicacao).getTime() -
              new Date(a.dataPublicacao).getTime(),
          ),
          ...recentesNaoHomepage,
        ];

        // Limitar a 9 artigos
        return artigosOrdenados.slice(0, 9);
      }),
    );
  }

  /**
   * Lista artigos publicados (público)
   * API docs: GET /artigos/publicados -> ArtigosListResponseDto
   */
  listarPublicados(
    limit = 9,
    page = 1,
    sort = "dataPublicacao:desc",
    categoria?: string,
  ): Observable<Artigo[]> {
    let params = new HttpParams()
      .set("limit", limit.toString())
      .set("page", page.toString());

    // Mapear sort para sortBy e sortOrder
    if (sort) {
      const [sortBy, sortOrder] = sort.split(":");
      params = params.set("sortBy", sortBy);
      params = params.set("sortOrder", sortOrder || "desc");
    }

    if (categoria) {
      params = params.set("categoria", categoria);
    }

    return this.http.get<any>(`${this.apiUrl}/publicados`, { params }).pipe(
      map((resp) => {
        const responseData = resp?.data;
        if (!responseData || !Array.isArray(responseData.data)) {
          return [];
        }
        return responseData.data.map((artigo: ArtigoResponseDto) => this.mapArtigoFromApi(artigo));
      }),
    );
  }

  /**
   * Obtém um artigo específico por ID
   */
  obterArtigo(id: string): Observable<Artigo> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        const artigo = response?.data?.data || response?.data;
        if (!artigo) {
          throw new Error("Artigo não encontrado na resposta da API");
        }
        return this.mapArtigoFromApi(artigo);
      }),
    );
  }

  /**
   * Cria um novo artigo com upload de imagem opcional
   */
  criarArtigo(artigo: ArtigoInput, imagemCapa?: File): Observable<Artigo> {
    const formData = new FormData();

    // Adiciona os dados do artigo
    formData.append("titulo", artigo.titulo);
    formData.append("conteudo", JSON.stringify(artigo.conteudo));
    formData.append("resumo", artigo.resumo || "");
    formData.append("autorId", artigo.autorId);
    formData.append("categoria", artigo.categoria);
    formData.append("status", artigo.status);

    if (artigo.dataPublicacao) {
      formData.append("dataPublicacao", artigo.dataPublicacao);
    }

    // Adiciona a imagem se fornecida
    if (imagemCapa) {
      formData.append("imagemCapa", imagemCapa);
    }

    return this.http.post<any>(this.apiUrl, formData).pipe(
      map((response) => {
        const artigo = response?.data;
        if (!artigo) {
          throw new Error("Artigo não encontrado na resposta da API");
        }
        return this.mapArtigoFromApi(artigo);
      }),
    );
  }

  /**
   * Atualiza um artigo existente com upload de imagem opcional
   */
  atualizarArtigo(
    id: string,
    artigo: ArtigoInput,
    imagemCapa?: File,
  ): Observable<Artigo> {
    const formData = new FormData();

    // Adiciona os dados do artigo
    formData.append("titulo", artigo.titulo);
    formData.append("conteudo", JSON.stringify(artigo.conteudo));
    formData.append("resumo", artigo.resumo || "");
    formData.append("autorId", artigo.autorId);
    formData.append("categoria", artigo.categoria);
    formData.append("status", artigo.status);

    if (artigo.dataPublicacao) {
      formData.append("dataPublicacao", artigo.dataPublicacao);
    }

    // Adiciona a imagem se fornecida
    if (imagemCapa) {
      formData.append("imagemCapa", imagemCapa);
    }

    return this.http.patch<any>(`${this.apiUrl}/${id}`, formData).pipe(
      map((response) => {
        const artigo = response?.data;
        if (!artigo) {
          throw new Error("Artigo não encontrado na resposta da API");
        }
        return this.mapArtigoFromApi(artigo);
      }),
    );
  }

  /**
   * Atualiza parcialmente um artigo (ex: apenas destaque)
   */
  atualizarParcialArtigo(
    id: string,
    dados: Partial<ArtigoInput>,
  ): Observable<Artigo> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, dados).pipe(
      map((response) => {
        const artigo = response?.data;
        if (!artigo) {
          throw new Error("Artigo não encontrado na resposta da API");
        }
        return this.mapArtigoFromApi(artigo);
      }),
    );
  }

  /**
   * Exclui um artigo
   */
  excluirArtigo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Registra uma visualização de artigo
   */
  registrarVisualizacao(
    artigoId: string,
    userId?: string,
  ): Observable<{ totalViews: number; contabilizada: boolean }> {
    const fingerprint = this.fingerprintService.getFingerprint();
    return this.http
      .post<any>(`${this.apiUrl}/${artigoId}/view`, {
        fingerprint,
        userId,
      })
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Verifica se já visualizou o artigo
   */
  verificarVisualizacao(artigoId: string): Observable<boolean> {
    const fingerprint = this.fingerprintService.getFingerprint();
    let params = new HttpParams().set("fingerprint", fingerprint);
    return this.http
      .get<any>(`${this.apiUrl}/${artigoId}/view/check`, { params })
      .pipe(
        map(
          (response) =>
            response?.data?.visualizado || response?.visualizado || false,
        ),
      );
  }

  /**
   * Toggle curtida em um artigo (adiciona ou remove)
   */
  toggleCurtida(
    artigoId: string,
    userId?: string,
  ): Observable<{ curtido: boolean; totalCurtidas: number }> {
    const fingerprint = this.fingerprintService.getFingerprint();
    return this.http
      .post<any>(`${this.apiUrl}/${artigoId}/curtida/toggle`, {
        fingerprint,
        userId,
      })
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Verifica se já curtiu o artigo
   */
  verificarCurtida(artigoId: string): Observable<boolean> {
    const fingerprint = this.fingerprintService.getFingerprint();
    let params = new HttpParams().set("fingerprint", fingerprint);
    return this.http
      .get<any>(`${this.apiUrl}/${artigoId}/curtida/check`, { params })
      .pipe(
        map(
          (response) => response?.data?.curtido || response?.curtido || false,
        ),
      );
  }

  /**
   * Obtém estatísticas de curtidas de um artigo
   */
  obterEstatisticasCurtidas(
    artigoId: string,
    days: number = 30,
  ): Observable<{
    total: number;
    daily: Array<{ date: string; count: number }>;
  }> {
    let params = new HttpParams().set("days", days.toString());
    return this.http
      .get<any>(`${this.apiUrl}/${artigoId}/stats/curtidas`, { params })
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Obtém estatísticas de visualizações de um artigo
   */
  obterEstatisticasVisualizacoes(
    artigoId: string,
    days: number = 30,
  ): Observable<{
    total: number;
    unique: number;
    daily: Array<{ date: string; count: number }>;
  }> {
    let params = new HttpParams().set("days", days.toString());
    return this.http
      .get<any>(`${this.apiUrl}/${artigoId}/stats/views`, { params })
      .pipe(map((response) => response?.data || response));
  }

  /**
   * Lista todas as categorias de artigos existentes
   */
  listarCategorias(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/publicados/categorias`).pipe(
      map(response => response?.data || [])
    );
  }
}
