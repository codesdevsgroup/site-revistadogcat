import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import {
  CadastroCaoPayload,
  CadastroCaoResponse,
  FileValidation,
  TIPOS_ARQUIVO_IMAGEM,
  TAMANHO_MAX_IMAGEM,
  TAMANHO_MAX_VIDEO,
} from "../interfaces/cao.interface";

@Injectable({
  providedIn: "root",
})
export class CaoService {
  private readonly apiUrl = `${environment.apiUrl}/cadastro-cao`;
  private readonly apiRacasUrl = `${environment.apiUrl}/racas`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getRacas(): Observable<{ id: string; nome: string }[]> {
    return this.http
      .get<{ data: { racaId: string; nome: string }[] }>(this.apiRacasUrl)
      .pipe(
        map((response) =>
          response.data.map((raca) => ({ id: raca.racaId, nome: raca.nome })),
        ),
        catchError(this.handleError),
      );
  }

  cadastrarCaoUnificado(formData: FormData): Observable<CadastroCaoResponse> {
    return this.http
      .post<CadastroCaoResponse>(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  validarArquivoImagem(file: File): FileValidation {
    if (!TIPOS_ARQUIVO_IMAGEM.includes(file.type as any)) {
      return {
        isValid: false,
        error: "Tipo de arquivo não suportado. Use JPEG, JPG, PNG ou WebP.",
      };
    }
    if (file.size > TAMANHO_MAX_IMAGEM) {
      return {
        isValid: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB.",
      };
    }
    return { isValid: true, file };
  }

  validarArquivoVideo(file: File): FileValidation {
    const tiposVideoPermitidos = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/quicktime",
    ];
    if (!tiposVideoPermitidos.includes(file.type)) {
      return {
        isValid: false,
        error: "Tipo de arquivo não suportado. Use MP4, MOV, AVI ou QuickTime.",
      };
    }
    if (file.size > TAMANHO_MAX_VIDEO) {
      return {
        isValid: false,
        error: "Arquivo muito grande. Tamanho máximo: 50MB.",
      };
    }
    return { isValid: true, file };
  }

  criarPreviewImagem(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject("Erro ao ler o arquivo");
      reader.readAsDataURL(file);
    });
  }

  formatarTamanhoArquivo(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private handleError(error: any): Observable<never> {
    const errorMessage =
      error.error?.message || error.message || "Erro desconhecido";
    console.error("Erro no serviço de cães:", errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
