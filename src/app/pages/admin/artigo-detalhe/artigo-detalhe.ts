import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TiptapEditorComponent } from '../components/tiptap-editor/tiptap-editor';
import { ArtigosService, Artigo, ArtigoInput } from '../../../services/artigos.service';

@Component({
  selector: 'app-artigo-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TiptapEditorComponent],
  templateUrl: './artigo-detalhe.html',
  styleUrl: './artigo-detalhe.scss'
})
export class ArtigoDetalheComponent implements OnInit {
  @ViewChild('fotoDestaqueInput') fotoDestaqueInput!: ElementRef<HTMLInputElement>;

  artigoForm: FormGroup;
  artigoId: string | null = null;
  isEditMode = false;
  fotoDestaque: string | null = null;
  fotoDestaqueFile: File | null = null;

  // Opções para os selects
  autores = [
    { id: 1, nome: 'Dr. João Silva' },
    { id: 2, nome: 'Dra. Maria Santos' },
    { id: 3, nome: 'Dr. Pedro Costa' },
    { id: 4, nome: 'Dra. Ana Oliveira' }
  ];

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
    private artigosService: ArtigosService
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
      fotoDestaque: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.artigoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.artigoId !== null && this.artigoId !== 'novo';

    if (this.isEditMode) {
      this.carregarArtigo();
    } else {
      // Definir data atual para novos artigos
      const hoje = new Date().toISOString().split('T')[0];
      this.artigoForm.patchValue({ dataPublicacao: hoje });
    }
  }

  carregarArtigo(): void {
    // Simular carregamento de dados do artigo
    const artigoMock = {
      titulo: 'Como Cuidar da Saúde do seu Pet',
      resumo: 'Descubra as melhores práticas para manter seu pet saudável e feliz, incluindo dicas de alimentação, exercícios e cuidados veterinários essenciais.',
      autor: '1',
      categoria: '1',
      status: 'publicado',
      dataPublicacao: '2024-01-15',
      publico: 'publico',
      conteudo: '<h2>Introdução</h2><p>Este artigo aborda os principais cuidados com a saúde dos pets...</p>',
      fotoDestaque: 'https://via.placeholder.com/400x240/4CAF50/FFFFFF?text=Foto+de+Destaque'
    };

    this.artigoForm.patchValue(artigoMock);
    this.fotoDestaque = artigoMock.fotoDestaque;
  }

  onSubmit(): void {
    if (this.artigoForm.valid) {
      const formData = this.artigoForm.value;
      console.log('Dados do artigo:', formData);

      // Aqui seria feita a chamada para o backend
      alert('Artigo salvo com sucesso!');
    } else {
      console.log('Formulário inválido');
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/artigos']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.artigoForm.controls).forEach(key => {
      const control = this.artigoForm.get(key);
      control?.markAsTouched();
    });
  }

  // Método para atualizar o conteúdo do editor
  onContentChange(content: string): void {
    this.artigoForm.patchValue({ conteudo: content });
  }

  // Método para upload da foto de destaque
  onFotoDestaqueChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Formato de arquivo não suportado. Use JPEG, PNG ou WebP.');
        return;
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande. O tamanho máximo é 5MB.');
        return;
      }

      this.fotoDestaqueFile = file;

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoDestaque = e.target.result;
        this.artigoForm.patchValue({ fotoDestaque: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para remover a foto de destaque
  removerFotoDestaque(): void {
    this.fotoDestaque = null;
    this.fotoDestaqueFile = null;
    this.artigoForm.patchValue({ fotoDestaque: '' });

    // Limpar o input file usando a referência do ViewChild
    if (this.fotoDestaqueInput) {
      this.fotoDestaqueInput.nativeElement.value = '';
    }
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
