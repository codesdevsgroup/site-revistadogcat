import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// Substitui o editor TipTap pelo Editor mais completo do PrimeNG
import { EditorModule } from 'primeng/editor';
import { ArtigosService } from '../../../services/artigos.service';
import type { Artigo, ArtigoInput } from '../../../interfaces/artigo.interface';
import { UsuarioService } from '../../../services/usuario.service';
import { NotificationService } from '../../../services/notification.service';
import type { Usuario } from '../../../interfaces/usuario.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-artigo-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditorModule],
  templateUrl: './artigo-detalhe.html',
  styleUrl: './artigo-detalhe.scss'
})
export class ArtigoDetalheComponent implements OnInit {
  @ViewChild('fotoDestaqueInput') fotoDestaqueInput!: ElementRef<HTMLInputElement>;

  artigoForm: FormGroup;
  artigoId: string | null = null;
  isEditMode = false;
  fotoDestaque: string | null = null;
  imagemOriginalUrl: string | null = null;
  imagemSelecionada: File | null = null;
  artigoCarregado = false;
  dataCriacao: Date | null = null;
  dataUltimaEdicao: Date | null = null;
  public apiUrl = environment.apiUrl;

  // Autores carregados da API de usuários
  autores: Usuario[] = [];

  categorias = [
    { id: 1, nome: 'Saúde' },
    { id: 2, nome: 'Comportamento' },
    { id: 3, nome: 'Alimentação' },
    { id: 4, nome: 'Cuidados' },
    { id: 5, nome: 'Treinamento' }
  ];

  statusOptions = [
    { value: 'rascunho', label: 'Rascunho' },
    { value: 'revisao', label: 'Em Revisão' },
    { value: 'publicado', label: 'Publicado' },
    { value: 'arquivado', label: 'Arquivado' }
  ];

  publicoOptions = [
    { value: 'publico', label: 'Público' },
    { value: 'assinantes', label: 'Apenas Assinantes' },
    { value: 'privado', label: 'Privado (Admins)' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private artigosService: ArtigosService,
    private usuarioService: UsuarioService,
    private notificationService: NotificationService
  ) {
    this.artigoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      resumo: ['', [Validators.maxLength(300)]], // Resumo opcional do artigo (máximo 300 caracteres)
      autor: ['', Validators.required],
      categoria: ['', Validators.required],
      status: ['rascunho', Validators.required],
      dataPublicacao: ['', Validators.required],
      publico: ['publico', Validators.required],
      conteudo: ['', Validators.required],
      fotoDestaque: [''] // Foto de destaque será obrigatória apenas para novos artigos
    });
  }

  ngOnInit(): void {
    this.artigoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.artigoId !== null && this.artigoId !== 'novo';

    // Carregar autores do backend (roles EDITOR/ADMIN)
    this.usuarioService.getUsers().subscribe({
      next: (users) => {
        this.autores = (users || []).filter(u => ['EDITOR', 'ADMIN'].includes(u.role));
        if (this.autores.length === 0) {
          this.notificationService.warning('Nenhum autor encontrado. Verifique se existem usuários com perfil de Editor ou Admin.');
        }
      },
      error: (err) => {
        console.error('Falha ao carregar autores:', err);
        this.notificationService.error('Erro ao carregar lista de autores. Tente recarregar a página.');
      }
    });

    if (this.isEditMode) {
      this.carregarArtigo();
    } else {
      // Definir data atual para novos artigos
      const hoje = new Date().toISOString().split('T')[0];
      this.artigoForm.patchValue({ dataPublicacao: hoje });
      // Para novos artigos, a foto de destaque é obrigatória
      this.artigoForm.get('fotoDestaque')?.setValidators([Validators.required]);
      this.artigoForm.get('fotoDestaque')?.updateValueAndValidity();
    }
  }

  carregarArtigo(): void {
    if (!this.artigoId) return;

    this.artigosService.obterArtigo(this.artigoId).subscribe({
      next: (artigo) => {
        // Mapear dados do artigo para o formulário
        const formData = {
          titulo: artigo.titulo,
          resumo: artigo.resumo || '',
          autor: artigo.autorId,
          categoria: this.mapCategoriaToForm(artigo.categoria),
          status: this.mapStatusToForm(artigo.status),
          dataPublicacao: artigo.dataPublicacao.split('T')[0], // Converter para formato de data do input
          publico: 'publico', // Valor padrão por enquanto
          conteudo: typeof artigo.conteudo === 'object' ? this.extractHtmlFromContent(artigo.conteudo) : artigo.conteudo,
          fotoDestaque: artigo.imagemCapa || ''
        };

        console.log('Dados do artigo carregado:', formData);
        this.artigoForm.patchValue(formData);
        
        // Forçar atualização do conteúdo após um pequeno delay para garantir que o TipTap esteja pronto
        setTimeout(() => {
          const conteudoValue = typeof artigo.conteudo === 'object' ? this.extractHtmlFromContent(artigo.conteudo) : artigo.conteudo;
          this.artigoForm.get('conteudo')?.setValue(conteudoValue || '');
          this.artigoForm.get('conteudo')?.markAsTouched();
          console.log('Conteúdo definido no formulário:', this.artigoForm.get('conteudo')?.value);
        }, 100);
        this.fotoDestaque = artigo.imagemCapa || null;
        this.imagemOriginalUrl = artigo.imagemCapa || null; // Armazenar URL original
        
        // Para artigos existentes, a foto de destaque não é obrigatória
        // (pode manter a imagem atual ou trocar por uma nova)
        this.artigoForm.get('fotoDestaque')?.clearValidators();
        this.artigoForm.get('fotoDestaque')?.updateValueAndValidity();
        
        // Definir datas
        this.dataCriacao = new Date(artigo.createdAt);
        this.dataUltimaEdicao = new Date(artigo.updatedAt);
        this.artigoCarregado = true;
      },
      error: (error) => {
        console.error('Erro ao carregar artigo:', error);
        this.notificationService.error('Erro ao carregar artigo. Verifique se o ID está correto.');
        this.router.navigate(['/admin/artigos']);
      }
    });
  }

  // Mapear categoria do backend para o formulário
  private mapCategoriaToForm(categoria: string): string {
    const categoriaMap: Record<string, string> = {
      'SAUDE': 'Saúde',
      'COMPORTAMENTO': 'Comportamento',
      'ALIMENTACAO': 'Alimentação',
      'CUIDADOS': 'Cuidados',
      'TREINAMENTO': 'Treinamento'
    };
    return categoriaMap[categoria] || 'Saúde';
  }

  // Mapear status do backend para o formulário
  private mapStatusToForm(status: string): string {
    const statusMap: Record<string, string> = {
      'RASCUNHO': 'rascunho',
      'REVISAO': 'revisao',
      'PUBLICADO': 'publicado',
      'ARQUIVADO': 'arquivado'
    };
    return statusMap[status] || 'rascunho';
  }

  // Extrair HTML do conteúdo TipTap
  private extractHtmlFromContent(content: any): string {
    if (typeof content === 'string') return content;
    if (content && content.html) return content.html;
    // Se for um objeto TipTap, tentar converter para HTML básico
    if (content && content.type === 'doc' && content.content) {
      return this.convertTipTapToHtml(content);
    }
    return '';
  }

  // Converter conteúdo TipTap básico para HTML
  private convertTipTapToHtml(content: any): string {
    if (!content.content) return '';
    
    let html = '';
    for (const node of content.content) {
      if (node.type === 'paragraph' && node.content) {
        html += '<p>';
        for (const textNode of node.content) {
          if (textNode.type === 'text') {
            html += textNode.text || '';
          }
        }
        html += '</p>';
      } else if (node.type === 'heading' && node.content) {
        const level = node.attrs?.level || 1;
        html += `<h${level}>`;
        for (const textNode of node.content) {
          if (textNode.type === 'text') {
            html += textNode.text || '';
          }
        }
        html += `</h${level}>`;
      }
    }
    return html;
  }

  onSubmit(): void {
    console.log('=== VALIDAÇÃO DO FORMULÁRIO ===');
    console.log('Formulário válido?', this.artigoForm.valid);
    console.log('Valores do formulário:', this.artigoForm.value);
    console.log('Status dos campos:');
    Object.keys(this.artigoForm.controls).forEach(key => {
      const control = this.artigoForm.get(key);
      console.log(`- ${key}: válido=${control?.valid}, valor="${control?.value}", erros=`, control?.errors);
    });
    
    if (!this.artigoForm.valid) {
      console.log('❌ Formulário inválido - parando execução');
      this.markFormGroupTouched();
      this.mostrarErrosValidacao();
      return;
    }
    
    console.log('✅ Formulário válido - prosseguindo com salvamento');

    const formData = this.artigoForm.value;

    // Normalizar status para o enum do backend
    const statusMap: Record<string, string> = {
      rascunho: 'RASCUNHO',
      revisao: 'REVISAO',
      publicado: 'PUBLICADO',
      arquivado: 'ARQUIVADO'
    };

    const categoriaMap: Record<string, string> = {
      'Saúde': 'SAUDE',
      'Comportamento': 'COMPORTAMENTO',
      'Alimentação': 'ALIMENTACAO',
      'Cuidados': 'CUIDADOS',
      'Treinamento': 'TREINAMENTO'
    };

    const payloadBase: Omit<ArtigoInput, 'imagemCapa'> = {
      titulo: formData.titulo,
      conteudo: { html: formData.conteudo },
      resumo: formData.resumo || undefined,
      autorId: formData.autor, // userId do autor selecionado
      categoria: categoriaMap[formData.categoria] || formData.categoria,
      status: statusMap[formData.status] || 'RASCUNHO',
      dataPublicacao: formData.dataPublicacao,
      destaque: false,
      tags: undefined
    };

    // Criar/atualizar artigo com upload de imagem em uma única requisição
    console.log('=== INÍCIO DO PROCESSO DE SALVAMENTO ===');
    console.log('Imagem selecionada para upload:', !!this.imagemSelecionada);
    console.log('Payload base:', payloadBase);
    
    let operacao$: Observable<Artigo>;
    
    if (this.isEditMode && this.artigoId) {
       // Modo edição - atualizar artigo existente
       operacao$ = this.artigosService.atualizarArtigo(this.artigoId, payloadBase, this.imagemSelecionada || undefined);
     } else {
       // Modo criação - criar novo artigo
       operacao$ = this.artigosService.criarArtigo(payloadBase, this.imagemSelecionada || undefined);
     }
    
    operacao$
      .subscribe({
        next: (artigo: Artigo) => {
          const mensagem = this.isEditMode ? 'Artigo atualizado com sucesso!' : 'Artigo criado com sucesso!';
          this.notificationService.success(mensagem);
          this.router.navigate(['/admin/artigos']);
        },
        error: (error) => {
          console.error('Erro ao salvar artigo:', error);
          const mensagem = this.isEditMode ? 'Erro ao atualizar artigo.' : 'Erro ao criar artigo.';
          this.notificationService.error(mensagem + ' Verifique os campos obrigatórios e tente novamente.');
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/admin/artigos']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.artigoForm.controls).forEach(key => {
      const control = this.artigoForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Mostra erros de validação específicos para cada campo
   */
  private mostrarErrosValidacao(): void {
    console.log('=== VERIFICAÇÃO DETALHADA DE ERROS ===');
    const erros: string[] = [];
    
    // Verificar cada campo e seus valores atuais
    const titulo = this.artigoForm.get('titulo');
    console.log('Campo título:', { valid: titulo?.valid, value: titulo?.value, errors: titulo?.errors });
    if (titulo?.invalid) {
      const valor = titulo.value;
      if (!valor || valor.trim() === '') {
        erros.push('Título não pode estar vazio');
      } else if (titulo.errors?.['minlength']) {
        erros.push('Título deve ter pelo menos 3 caracteres');
      }
    }
    
    const autor = this.artigoForm.get('autor');
    console.log('Campo autor:', { valid: autor?.valid, value: autor?.value, errors: autor?.errors });
    if (autor?.invalid) {
      const valor = autor.value;
      if (!valor || valor === '') {
        erros.push('Autor não foi selecionado');
      }
    }
    
    const categoria = this.artigoForm.get('categoria');
    console.log('Campo categoria:', { valid: categoria?.valid, value: categoria?.value, errors: categoria?.errors });
    if (categoria?.invalid) {
      const valor = categoria.value;
      if (!valor || valor === '') {
        erros.push('Categoria não foi selecionada');
      }
    }
    
    const dataPublicacao = this.artigoForm.get('dataPublicacao');
    console.log('Campo dataPublicacao:', { valid: dataPublicacao?.valid, value: dataPublicacao?.value, errors: dataPublicacao?.errors });
    if (dataPublicacao?.invalid) {
      const valor = dataPublicacao.value;
      if (!valor || valor === '') {
        erros.push('Data de publicação não foi definida');
      }
    }
    
    const conteudo = this.artigoForm.get('conteudo');
    console.log('Campo conteudo:', { valid: conteudo?.valid, value: conteudo?.value, errors: conteudo?.errors });
    if (conteudo?.invalid) {
      const valor = conteudo.value;
      if (!valor || valor.trim() === '') {
        erros.push('Conteúdo está vazio');
      }
    }
    
    const fotoDestaque = this.artigoForm.get('fotoDestaque');
    console.log('Campo fotoDestaque:', { valid: fotoDestaque?.valid, value: fotoDestaque?.value, errors: fotoDestaque?.errors });
    console.log('Estado da imagem:', { fotoDestaque: this.fotoDestaque, isEditMode: this.isEditMode });
    if (fotoDestaque?.invalid) {
      const valor = fotoDestaque.value;
      // Para novos artigos, a foto é obrigatória
      // Para artigos existentes, pode manter a imagem atual
      if (!valor && !this.fotoDestaque && !this.isEditMode) {
        erros.push('Foto de destaque é obrigatória para novos artigos');
      }
    }
    
    if (this.resumo?.invalid && this.resumo.errors?.['maxlength']) {
      erros.push('Resumo deve ter no máximo 300 caracteres');
    }
    
    console.log('=== RESULTADO DA VALIDAÇÃO ===');
    console.log('Total de erros encontrados:', erros.length);
    console.log('Lista de erros:', erros);
    
    if (erros.length > 0) {
      this.notificationService.error(`Problemas encontrados: ${erros.join(', ')}`);
      console.log('❌ Erros específicos detectados');
      console.log('Valores do formulário:', this.artigoForm.value);
      console.log('Status do formulário:', this.artigoForm.status);
      console.log('Erros do formulário:', this.artigoForm.errors);
    } else {
      this.notificationService.warning('Formulário inválido. Verifique todos os campos.');
      console.log('⚠️ Formulário inválido mas sem erros específicos detectados');
      console.log('Valores do formulário:', this.artigoForm.value);
      console.log('Status do formulário:', this.artigoForm.status);
      console.log('Controles inválidos:');
      Object.keys(this.artigoForm.controls).forEach(key => {
        const control = this.artigoForm.get(key);
        if (control?.invalid) {
          console.log(`- ${key}: erros=`, control.errors);
        }
      });
    }
  }

  // Método para atualizar o conteúdo do editor
  onContentChange(content: string): void {
    this.artigoForm.patchValue({ conteudo: content });
  }

  // Método para upload da foto de destaque
  onFotoDestaqueChange(event: any): void {
    const file = event.target.files[0];
    console.log('=== NOVA IMAGEM SELECIONADA ===');
    console.log('Arquivo selecionado:', file);
    
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Formato de arquivo não suportado. Use JPEG, PNG ou WebP.');
        return;
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.notificationService.error('Arquivo muito grande. O tamanho máximo é 5MB.');
        return;
      }

      this.imagemSelecionada = file;
      console.log('imagemSelecionada definida:', !!this.imagemSelecionada);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoDestaque = e.target.result;
        this.artigoForm.patchValue({ fotoDestaque: e.target.result });
        console.log('Preview criado, fotoDestaque atualizada');
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para remover a foto de destaque
  removerFotoDestaque(): void {
    // Limpar a imagem selecionada
    this.imagemSelecionada = null;
    
    // Remover a foto de destaque atual
    this.fotoDestaque = null;
    this.artigoForm.patchValue({ fotoDestaque: '' });

    // Limpar o input file usando a referência do ViewChild
    if (this.fotoDestaqueInput) {
      this.fotoDestaqueInput.nativeElement.value = '';
    }

    // Em modo de criação, reativar a validação obrigatória
    if (!this.isEditMode) {
      this.artigoForm.get('fotoDestaque')?.setValidators([Validators.required]);
      this.artigoForm.get('fotoDestaque')?.updateValueAndValidity();
    }
  }

  getImagemUrl(imagePath: string | null): string {
    if (!imagePath) {
      return ''; // Ou uma imagem padrão
    }
    // Se for um data URL (preview), retorna diretamente
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }
    const filename = imagePath.split('/').pop();
    return `${this.apiUrl}/artigos/imagem/${filename}`;
  }

  // Getters para facilitar acesso aos controles do formulário
  get titulo() { return this.artigoForm.get('titulo'); }
  get resumo() { return this.artigoForm.get('resumo'); }
  get autor() { return this.artigoForm.get('autor'); }
  get categoria() { return this.artigoForm.get('categoria'); }
  get status() { return this.artigoForm.get('status'); }
  get dataPublicacao() { return this.artigoForm.get('dataPublicacao'); }
  get publico() { return this.artigoForm.get('publico'); }
  get conteudo() { return this.artigoForm.get('conteudo'); }
  get fotoDestaqueControl() { return this.artigoForm.get('fotoDestaque'); }
}
