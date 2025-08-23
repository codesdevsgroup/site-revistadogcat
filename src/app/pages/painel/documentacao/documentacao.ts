import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DocumentoInfo {
  id: string;
  titulo: string;
  arquivo: string;
  descricao: string;
  icone: string;
}

@Component({
  selector: 'app-documentacao',
  imports: [CommonModule, MarkdownModule, RouterModule],
  templateUrl: './documentacao.html',
  styleUrl: './documentacao.scss'
})
export class DocumentacaoComponent implements OnInit {
  documentos: DocumentoInfo[] = [
    {
      id: 'artigos',
      titulo: 'API de Artigos',
      arquivo: 'artigos_api.md',
      descricao: 'Endpoints para gerenciamento de artigos',
      icone: 'fas fa-newspaper'
    },
    {
      id: 'usuarios',
      titulo: 'API de Usuários e Autenticação',
      arquivo: 'usuarios_api.md',
      descricao: 'Endpoints para autenticação e usuários',
      icone: 'fas fa-users'
    },
    {
      id: 'cadastro-cao',
      titulo: 'API de Cadastro de Cão',
      arquivo: 'cadastro_cao_api.md',
      descricao: 'Endpoints para cadastro e gerenciamento de cães',
      icone: 'fas fa-dog'
    },
    {
      id: 'errors',
      titulo: 'Padrão de Códigos de Status HTTP',
      arquivo: 'error_codes.md',
      descricao: 'Padrão de códigos de status HTTP',
      icone: 'fas fa-exclamation-triangle'
    }
  ];

  documentoAtual: string | null = null;
  conteudoMarkdown: Observable<string> = of('');
  carregando = false;
  erro = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const docId = params['doc'];
      if (docId) {
         this.carregarDocumento(docId);
       } else {
         this.carregarDocumento('artigos');
       }
    });
  }

  carregarDocumento(docId: string) {
    const documento = this.documentos.find(d => d.id === docId);
    if (!documento) {
      this.erro = true;
      return;
    }

    this.documentoAtual = docId;
    this.carregando = true;
    this.erro = false;

    const url = `/docs/${documento.arquivo}`;
    this.conteudoMarkdown = this.http.get(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('Erro ao carregar documento:', error);
          this.erro = true;
          this.carregando = false;
          return of('# Erro\n\nNão foi possível carregar o documento.');
        })
      );

    this.conteudoMarkdown.subscribe(() => {
      this.carregando = false;
    });
  }

  navegarPara(docId: string) {
    this.router.navigate(['/painel/documentacao', docId]);
  }

  getDocumentoAtual(): DocumentoInfo | undefined {
    return this.documentos.find(d => d.id === this.documentoAtual);
  }
}

