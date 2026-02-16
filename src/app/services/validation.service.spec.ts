import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ValidationService } from './validation.service';
import { TIPOS_ARQUIVO_IMAGEM, TAMANHO_MAX_IMAGEM } from '../interfaces/cao.interface';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ValidationService]
    });
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateImageFile', () => {
    it('should return valid: true for supported image types within size limit', () => {
      TIPOS_ARQUIVO_IMAGEM.forEach(type => {
        const file = new File([''], `test-image.${type.split('/')[1]}`, { type });
        const result = service.validateImageFile(file);
        expect(result).toEqual({ valid: true });
      });
    });

    it('should return valid: false for unsupported file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const result = service.validateImageFile(file);
      expect(result.valid).toBeFalse();
      expect(result.error).toBe('Tipo de arquivo não suportado. Use apenas JPG, PNG ou WEBP.');
    });

    it('should return valid: false for images exceeding max size', () => {
      // Create a file larger than TAMANHO_MAX_IMAGEM (5MB)
      const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: TAMANHO_MAX_IMAGEM + 1 });

      const result = service.validateImageFile(largeFile);
      expect(result.valid).toBeFalse();
      expect(result.error).toBe('Arquivo muito grande. Tamanho máximo: 5 MB');
    });
  });
});
