import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ValidationService } from './validation.service';
import { FormControl } from '@angular/forms';
import { TAMANHO_MAX_IMAGEM, TAMANHO_MAX_VIDEO } from '../interfaces/cao.interface';

describe('ValidationService', () => {
  let service: ValidationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ValidationService]
    });
    service = TestBed.inject(ValidationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateImageFile', () => {
    it('should return valid true for supported image types', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(service.validateImageFile(file)).toEqual({ valid: true });

      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      expect(service.validateImageFile(pngFile)).toEqual({ valid: true });

      const webpFile = new File([''], 'test.webp', { type: 'image/webp' });
      expect(service.validateImageFile(webpFile)).toEqual({ valid: true });
    });

    it('should return valid false for unsupported file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const result = service.validateImageFile(file);
      expect(result.valid).toBeFalse();
      expect(result.error).toContain('Tipo de arquivo não suportado');
    });

    it('should return valid false for files exceeding TAMANHO_MAX_IMAGEM', () => {
      const largeFile = { size: TAMANHO_MAX_IMAGEM + 1, type: 'image/jpeg' } as File;
      const result = service.validateImageFile(largeFile);
      expect(result.valid).toBeFalse();
      expect(result.error).toContain('Arquivo muito grande');
    });
  });

  describe('validateVideoFile', () => {
    it('should return valid true for supported video types', () => {
      const file = new File([''], 'test.mp4', { type: 'video/mp4' });
      expect(service.validateVideoFile(file).valid).toBeTrue();
    });

    it('should return valid false for unsupported video types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const result = service.validateVideoFile(file);
      expect(result.valid).toBeFalse();
      expect(result.error).toContain('Tipo de arquivo não suportado');
    });

    it('should return valid false for videos exceeding TAMANHO_MAX_VIDEO', () => {
      const largeFile = { size: TAMANHO_MAX_VIDEO + 1, type: 'video/mp4' } as File;
      const result = service.validateVideoFile(largeFile);
      expect(result.valid).toBeFalse();
      expect(result.error).toContain('Arquivo muito grande');
    });

    it('should return a warning for videos larger than 30MB', () => {
      const videoFile = { size: 31 * 1024 * 1024, type: 'video/mp4' } as File;
      const result = service.validateVideoFile(videoFile);
      expect(result.valid).toBeTrue();
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('O arquivo parece grande');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
      expect(service.formatFileSize(500)).toBe('500 Bytes');
      expect(service.formatFileSize(1024)).toBe('1 KB');
      expect(service.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(service.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('searchCepViaCep', () => {
    it('should return address data on success', (done) => {
      const mockResponse = {
        cep: '01234-567',
        logradouro: 'Rua Teste',
        bairro: 'Bairro Teste',
        localidade: 'Cidade Teste',
        uf: 'SP'
      };

      service.searchCepViaCep('01234567').then(response => {
        expect(response).toEqual(mockResponse as any);
        done();
      });

      const req = httpMock.expectOne('https://viacep.com.br/ws/01234567/json/');
      req.flush(mockResponse);
    });

    it('should return null if API returns error', (done) => {
      service.searchCepViaCep('99999999').then(response => {
        expect(response).toBeNull();
        done();
      });

      const req = httpMock.expectOne('https://viacep.com.br/ws/99999999/json/');
      req.flush({ erro: true });
    });

    it('should return null on HTTP error', (done) => {
      service.searchCepViaCep('01234567').then(response => {
        expect(response).toBeNull();
        done();
      });

      const req = httpMock.expectOne('https://viacep.com.br/ws/01234567/json/');
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('searchCepCorreios', () => {
    it('should return address data on status 200', (done) => {
      const mockResponse = {
        cep: '01234-567',
        street: 'Rua Teste',
        status: 200
      };

      service.searchCepCorreios('01234567').then(response => {
        expect(response).toEqual(mockResponse as any);
        done();
      });

      const req = httpMock.expectOne('https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente/consultaCEP?cep=01234567');
      req.flush(mockResponse);
    });

    it('should return null on non-200 status', (done) => {
      service.searchCepCorreios('01234567').then(response => {
        expect(response).toBeNull();
        done();
      });

      const req = httpMock.expectOne('https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente/consultaCEP?cep=01234567');
      req.flush({ status: 404 });
    });
  });

  describe('formatCep', () => {
    it('should format numeric string to CEP pattern', () => {
      expect(service.formatCep('01234567')).toBe('01234-567');
      expect(service.formatCep('01234')).toBe('01234');
    });
  });

  describe('validateCpf', () => {
    it('should return true for valid CPF', () => {
      // 123.456.789-09 is a valid CPF
      expect(service.validateCpf('12345678909')).toBeTrue();
      expect(service.validateCpf('123.456.789-09')).toBeTrue();
    });

    it('should return false for CPF with all identical digits', () => {
      expect(service.validateCpf('11111111111')).toBeFalse();
    });

    it('should return false for CPF with wrong length', () => {
      expect(service.validateCpf('1234567890')).toBeFalse();
      expect(service.validateCpf('123456789012')).toBeFalse();
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(service.validateCpf('12345678900')).toBeFalse();
    });
  });

  describe('formatCpf', () => {
    it('should format numeric string to CPF pattern', () => {
      expect(service.formatCpf('12345678909')).toBe('123.456.789-09');
    });
  });

  describe('formatPhone', () => {
    it('should format 11-digit phone numbers', () => {
      expect(service.formatPhone('11912345678')).toBe('(11) 91234-5678');
    });

    it('should format 10-digit phone numbers', () => {
      expect(service.formatPhone('1112345678')).toBe('(11) 1234-5678');
    });

    it('should return unformatted for other lengths', () => {
      expect(service.formatPhone('1234567')).toBe('1234567');
    });
  });

  describe('cpfValidator', () => {
    it('should return null for valid CPF', () => {
      const control = new FormControl('12345678909');
      const validator = service.cpfValidator();
      expect(validator(control)).toBeNull();
    });

    it('should return an error object for invalid CPF', () => {
      const control = new FormControl('12345678900');
      const validator = service.cpfValidator();
      expect(validator(control)).toEqual({ 'cpfInvalido': { value: '12345678900' } });
    });

    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = service.cpfValidator();
      expect(validator(control)).toBeNull();
    });
  });
});
