import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EdicoesService } from './edicoes.service';
import { Edicao } from '../interfaces/edicao';
import { environment } from '../../environments/environment';

describe('EdicoesService', () => {
  let service: EdicoesService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/edicoes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EdicoesService]
    });
    service = TestBed.inject(EdicoesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listarEdicoes', () => {
    it('should return editions when response contains data property as array', () => {
      const mockEdicoes: Edicao[] = [
        { id: '1', titulo: 'Edição 1', data: '2023-01-01' },
        { id: '2', titulo: 'Edição 2', data: '2023-02-01' }
      ];
      const mockResponse = {
        data: mockEdicoes,
        statusCode: 200,
        message: 'Success'
      };

      service.listarEdicoes().subscribe((edicoes) => {
        expect(edicoes.length).toBe(2);
        expect(edicoes).toEqual(mockEdicoes);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return editions when response is directly an array', () => {
      const mockEdicoes: Edicao[] = [
        { id: '3', titulo: 'Edição 3', data: '2023-03-01' }
      ];

      service.listarEdicoes().subscribe((edicoes) => {
        expect(edicoes.length).toBe(1);
        expect(edicoes).toEqual(mockEdicoes);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockEdicoes);
    });

    it('should return empty array when response is invalid', () => {
      const mockResponse = { foo: 'bar' };

      service.listarEdicoes().subscribe((edicoes) => {
        expect(edicoes.length).toBe(0);
        expect(edicoes).toEqual([]);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include query parameters when provided', () => {
      const params = { ano: 2023, page: 1, limit: 10 };

      service.listarEdicoes(params).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === apiUrl &&
               request.params.get('ano') === '2023' &&
               request.params.get('page') === '1' &&
               request.params.get('limit') === '10';
      });
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should include partial query parameters', () => {
      const params = { ano: 2023 };

      service.listarEdicoes(params).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === apiUrl &&
               request.params.has('ano') &&
               !request.params.has('page') &&
               !request.params.has('limit');
      });
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('obterEdicao', () => {
    it('should return an edition by id', () => {
      const mockEdicao: Edicao = { id: '1', titulo: 'Edição 1', data: '2023-01-01' };
      const mockResponse = { data: mockEdicao };

      service.obterEdicao('1').subscribe((edicao) => {
        expect(edicao).toEqual(mockEdicao);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle response without data property', () => {
      const mockEdicao: Edicao = { id: '1', titulo: 'Edição 1', data: '2023-01-01' };

      service.obterEdicao('1').subscribe((edicao) => {
        expect(edicao).toEqual(mockEdicao);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(mockEdicao);
    });
  });

  describe('listarUltima', () => {
    it('should return the last edition', () => {
      const mockEdicao: Edicao = { id: '1', titulo: 'Última Edição', data: '2023-12-01' };
      const mockResponse = { data: mockEdicao };

      service.listarUltima().subscribe((edicao) => {
        expect(edicao).toEqual(mockEdicao);
      });

      const req = httpMock.expectOne(`${apiUrl}/ultima`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle response without data property', () => {
      const mockEdicao: Edicao = { id: '1', titulo: 'Última Edição', data: '2023-12-01' };

      service.listarUltima().subscribe((edicao) => {
        expect(edicao).toEqual(mockEdicao);
      });

      const req = httpMock.expectOne(`${apiUrl}/ultima`);
      req.flush(mockEdicao);
    });
  });

  describe('criarEdicao', () => {
    it('should create an edition', () => {
      const formData = new FormData();
      formData.append('titulo', 'Nova Edição');
      const mockResponse = { success: true };

      service.criarEdicao(formData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });
  });

  describe('atualizarEdicao', () => {
    it('should update an edition', () => {
      const formData = new FormData();
      formData.append('titulo', 'Edição Atualizada');
      const mockEdicao: Edicao = { id: '1', titulo: 'Edição Atualizada', data: '2023-01-01' };
      const mockResponse = { data: mockEdicao };

      service.atualizarEdicao('1', formData).subscribe((edicao) => {
        expect(edicao).toEqual(mockEdicao);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });
  });

  describe('excluirEdicao', () => {
    it('should delete an edition', () => {
      service.excluirEdicao('1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
