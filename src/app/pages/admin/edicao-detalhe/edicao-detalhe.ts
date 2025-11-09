import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private fb: FormBuilder, private edicoesService: EdicoesService, private router: Router, private notificationService: NotificationService) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      data: ['', Validators.required]
    });
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
      event.target.value = '';
    }
  }

  onCapaSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Por favor, selecione uma imagem válida (JPEG, PNG ou WebP).');
        event.target.value = '';
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.notificationService.warning('A imagem deve ter no máximo 5MB.');
        event.target.value = '';
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
      formData.append('titulo', this.form.get('titulo')?.value);
      formData.append('descricao', this.form.get('descricao')?.value);
      formData.append('data', this.form.get('data')?.value);
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.markTouched();
      return;
    }
    this.criarEdicao();
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
}