import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { TIPOS_ARQUIVO_IMAGEM, TAMANHO_MAX_IMAGEM, TAMANHO_MAX_VIDEO } from '../interfaces/cao.interface';

// Interface para resposta da API ViaCEP
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Interface para resposta da API dos Correios
interface CorreiosResponse {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http: HttpClient) { }

  // Validação de arquivo de imagem
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo de arquivo
    if (!TIPOS_ARQUIVO_IMAGEM.includes(file.type as any)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não suportado. Use apenas JPG, PNG ou WEBP.'
      };
    }

    // Verificar tamanho do arquivo
    if (file.size > TAMANHO_MAX_IMAGEM) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(TAMANHO_MAX_IMAGEM)}`
      };
    }

    return { valid: true };
  }

  // Validação de arquivo de vídeo
  validateVideoFile(file: File): { valid: boolean; error?: string; warning?: string } {
    // Verificar tipo de arquivo
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    if (!videoTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não suportado. Use apenas MP4, AVI, MOV ou WMV.'
      };
    }

    // Verificar tamanho do arquivo
    if (file.size > TAMANHO_MAX_VIDEO) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(TAMANHO_MAX_VIDEO)}`
      };
    }

    // Validar duração do vídeo (aproximadamente através do tamanho)
    // Para vídeos de boa qualidade, 20 segundos ≈ 10-30MB dependendo da resolução
    let warning;
    if (file.size > 30 * 1024 * 1024) {
      warning = 'O arquivo parece grande para um vídeo de 20 segundos. Tem certeza que o vídeo tem no máximo 20 segundos?';
    }

    return { valid: true, warning };
  }

  // Formatar tamanho do arquivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Buscar CEP usando ViaCEP
  searchCepViaCep(cep: string): Promise<ViaCepResponse | null> {
    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`)
      .toPromise()
      .then(response => {
        if (response && !response.erro) {
          return response;
        }
        return null;
      })
      .catch(() => null);
  }

  // Buscar CEP usando API dos Correios (backup)
  searchCepCorreios(cep: string): Promise<CorreiosResponse | null> {
    return this.http.get<CorreiosResponse>(`https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente/consultaCEP?cep=${cep}`)
      .toPromise()
      .then(response => {
        if (response && response.status === 200) {
          return response;
        }
        return null;
      })
      .catch(() => null);
  }

  // Formatar CEP
  formatCep(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 5) {
      return cleanValue.substring(0, 5) + '-' + cleanValue.substring(5, 8);
    }
    return cleanValue;
  }

  // Validar CPF
  validateCpf(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    return remainder === parseInt(cpf.charAt(10));
  }

  // Formatar CPF
  formatCpf(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formatar telefone
  formatPhone(value: string): string {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 11) {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanValue.length === 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return cleanValue;
  }

  // Validador de CPF para formulários reativos
  cpfValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Não valida se estiver vazio (use required para isso)
      }
      
      const isValid = this.validateCpf(control.value);
      return isValid ? null : { 'cpfInvalido': { value: control.value } };
    };
  }
}