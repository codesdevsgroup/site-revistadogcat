import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EdicoesService } from '../../../services/edicoes.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-edicao-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edicao-detalhe.html',
  styleUrl: './edicao-detalhe.scss'
})
export class EdicaoDetalheComponent {
  form: FormGroup;
  saving = false;
  isLoading = false;
  selectedPdf: File | null = null;
  selectedCapa: File | null = null;
  edicaoId: string | null = null;
  isEdit = false;

  constructor(private fb: FormBuilder, private edicoesService: EdicoesService, private router: Router, private notificationService: NotificationService, private route: ActivatedRoute) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      data: ['', Validators.required]
    });
    this.edicaoId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.edicaoId && this.edicaoId !== 'novo';
    if (this.isEdit && this.edicaoId) {
      this.carregarEdicao(this.edicaoId);
    }
  }

  get titulo() { return this.form.get('titulo'); }
  get descricao() { return this.form.get('descricao'); }
  get data() { return this.form.get('data'); }

  onPdfSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedPdf = file;
      this.form.patchValue({ pdf: file.name });
      this.form.get('pdf')?.updateValueAndValidity();
    } else {
      this.notificationService.error('Por favor, selecione um arquivo PDF válido.');
      if (target) {
        target.value = '';
      }
    }
  }

  onCapaSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Por favor, selecione uma imagem válida (JPEG, PNG ou WebP).');
        if (target) {
          target.value = '';
        }
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.notificationService.warning('A imagem deve ter no máximo 5MB.');
        if (target) {
          target.value = '';
        }
        return;
      }
      
      this.selectedCapa = file;
    }
  }

  criarEdicao() {
    if (this.form.valid && this.selectedPdf) {
      this.isLoading = true;
      this.saving = true;
      
      const formData = new FormData();
      const titulo: string = (this.form.get('titulo')?.value ?? '').trim();
      const descricaoRaw: string = (this.form.get('descricao')?.value ?? '').trim();
      const dataRaw: string = this.form.get('data')?.value;

      formData.append('titulo', titulo);

      // Envia 'descricao' somente se houver conteúdo (backend valida mínimo de 10)
      if (descricaoRaw.length > 0) {
        formData.append('descricao', descricaoRaw);
      }

      // Converte data para ISO 8601 se fornecida
      if (dataRaw) {
        const iso = new Date(dataRaw).toISOString();
        formData.append('data', iso);
      }
      formData.append('pdf', this.selectedPdf);
      
      if (this.selectedCapa) {
        formData.append('capa', this.selectedCapa);
      }

      this.edicoesService.criarEdicao(formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/edicoes']);
        },
        error: (error) => {
          console.error('Erro ao criar edição:', error);
          this.isLoading = false;
          this.saving = false;
        }
      });
    } else {
      this.notificationService.error('Por favor, preencha todos os campos obrigatórios e selecione um arquivo PDF.');
    }
  }

  atualizarEdicao() {
    if (this.form.valid && this.edicaoId) {
      this.isLoading = true;
      this.saving = true;

      const formData = new FormData();
      const titulo: string = (this.form.get('titulo')?.value ?? '').trim();
      const descricaoRaw: string = (this.form.get('descricao')?.value ?? '').trim();
      const dataRaw: string = this.form.get('data')?.value;

      formData.append('titulo', titulo);
      if (descricaoRaw.length > 0) {
        formData.append('descricao', descricaoRaw);
      }
      if (dataRaw) {
        const iso = new Date(dataRaw).toISOString();
        formData.append('data', iso);
      }
      if (this.selectedPdf) {
        formData.append('pdf', this.selectedPdf);
      }
      if (this.selectedCapa) {
        formData.append('capa', this.selectedCapa);
      }

      this.edicoesService.atualizarEdicao(this.edicaoId, formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/edicoes']);
        },
        error: (error) => {
          console.error('Erro ao atualizar edição:', error);
          this.isLoading = false;
          this.saving = false;
        }
      });
    } else {
      this.notificationService.error('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markTouched();
      return;
    }
    if (this.isEdit) {
      this.atualizarEdicao();
    } else {
      this.criarEdicao();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/edicoes']);
  }

  cancelar(): void {
    this.router.navigate(['/admin/edicoes']);
  }

  private markTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  private carregarEdicao(id: string): void {
    this.isLoading = true;
    this.edicoesService.obterEdicao(id).subscribe({
      next: (e) => {
        this.form.patchValue({
          titulo: e.titulo ?? '',
          descricao: e.descricao ?? '',
          data: e.data ? new Date(e.data).toISOString().substring(0, 10) : ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar edição', err);
        this.notificationService.error('Não foi possível carregar a edição.');
        this.isLoading = false;
      }
    });
  }
}