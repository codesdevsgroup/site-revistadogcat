import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Cao,
  ProprietarioCao,
  CadastroCaoPayload,
  CadastroCaoResponse,
  ImageUploadResponse,
  FileValidation,
  TIPOS_ARQUIVO_IMAGEM,
  TAMANHO_MAX_IMAGEM,
  TAMANHO_MAX_VIDEO
} from '../interfaces/cao.interface';

@Injectable({
  providedIn: 'root'
})
export class CaoService {
  private readonly apiUrl = '/api/cadastro-cao';

  constructor(private http: HttpClient) {}

  /**
   * Realiza o cadastro completo do cão
   */
  cadastrarCao(payload: CadastroCaoPayload): Observable<CadastroCaoResponse> {
    return this.http.post<CadastroCaoResponse>(this.apiUrl, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Faz upload das fotos obrigatórias do cão
   */
  uploadFotos(fotoPerfil: File, fotoLateral: File): Observable<{ fotoPerfilUrl: string; fotoLateralUrl: string }> {
    const formData = new FormData();
    formData.append('fotoPerfil', fotoPerfil);
    formData.append('fotoLateral', fotoLateral);

    return this.http.post<{ fotoPerfilUrl: string; fotoLateralUrl: string }>(`${this.apiUrl}/fotos-upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Faz upload de vídeo do cão
   */
  uploadVideo(video: File): Observable<{ videoUrl: string }> {
    const formData = new FormData();
    formData.append('video', video);

    return this.http.post<{ videoUrl: string }>(`${this.apiUrl}/video-upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Faz upload de documentos do pedigree
   */
  uploadPedigree(pedigreeFrente?: File, pedigreeVerso?: File): Observable<{ pedigreeFrenteUrl?: string; pedigreeVersoUrl?: string }> {
    const formData = new FormData();
    
    if (pedigreeFrente) {
      formData.append('pedigreeFrente', pedigreeFrente);
    }
    
    if (pedigreeVerso) {
      formData.append('pedigreeVerso', pedigreeVerso);
    }

    return this.http.post<{ pedigreeFrenteUrl?: string; pedigreeVersoUrl?: string }>(`${this.apiUrl}/pedigree-upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Valida arquivo de imagem
   */
  validarArquivoImagem(file: File): FileValidation {
    // Verificar tipo de arquivo
    if (!TIPOS_ARQUIVO_IMAGEM.includes(file.type as any)) {
      return {
        isValid: false,
        error: 'Tipo de arquivo não suportado. Use JPEG, JPG, PNG ou WebP.'
      };
    }

    // Verificar tamanho do arquivo
    if (file.size > TAMANHO_MAX_IMAGEM) {
      return {
        isValid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
      };
    }

    return {
      isValid: true,
      file
    };
  }

  /**
   * Valida arquivo de vídeo
   */
  validarArquivoVideo(file: File): FileValidation {
    const tiposVideoPermitidos = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    
    // Verificar tipo de arquivo
    if (!tiposVideoPermitidos.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de arquivo não suportado. Use MP4, MOV, AVI ou QuickTime.'
      };
    }

    // Verificar tamanho do arquivo
    if (file.size > TAMANHO_MAX_VIDEO) {
      return {
        isValid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 50MB.'
      };
    }

    return {
      isValid: true,
      file
    };
  }

  /**
   * Cria preview de imagem em base64
   */
  criarPreviewImagem(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject('Erro ao ler o arquivo');
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Formata tamanho do arquivo para exibição
   */
  formatarTamanhoArquivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Busca dados de endereço pelo CEP usando ViaCEP
   */
  buscarEnderecoPorCep(cep: string): Observable<any> {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return throwError(() => new Error('CEP deve ter 8 dígitos'));
    }

    return this.http.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .pipe(
        map((response: any) => {
          if (response.erro) {
            throw new Error('CEP não encontrado');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Manipula erros das requisições HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Código: ${error.status}\nMensagem: ${error.message}`;
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Erro no serviço de cães:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}