import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TiptapEditorComponent } from '../../../components/tiptap-editor/tiptap-editor.component';

@Component({
  selector: 'app-artigo-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TiptapEditorComponent],
  templateUrl: './artigo-detalhe.component.html',
  styleUrl: './artigo-detalhe.component.scss'
})
export class ArtigoDetalheComponent implements OnInit {
  artigoForm: FormGroup;
  artigoId: string | null = null;
  isEditMode = false;

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
    private router: Router
  ) {
    this.artigoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      autor: ['', Validators.required],
      categoria: ['', Validators.required],
      status: ['rascunho', Validators.required],
      dataPublicacao: ['', Validators.required],
      publico: ['publico', Validators.required],
      conteudo: ['', Validators.required]
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
      autor: '1',
      categoria: '1',
      status: 'publicado',
      dataPublicacao: '2024-01-15',
      publico: 'publico',
      conteudo: '<h2>Introdução</h2><p>Este artigo aborda os principais cuidados com a saúde dos pets...</p>'
    };
    
    this.artigoForm.patchValue(artigoMock);
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
    this.router.navigate(['/painel/artigos']);
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

  // Getters para facilitar acesso aos controles do formulário
  get titulo() { return this.artigoForm.get('titulo'); }
  get autor() { return this.artigoForm.get('autor'); }
  get categoria() { return this.artigoForm.get('categoria'); }
  get status() { return this.artigoForm.get('status'); }
  get dataPublicacao() { return this.artigoForm.get('dataPublicacao'); }
  get publico() { return this.artigoForm.get('publico'); }
  get conteudo() { return this.artigoForm.get('conteudo'); }
}