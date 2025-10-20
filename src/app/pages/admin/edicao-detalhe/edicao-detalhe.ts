import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EdicoesService } from '../../../services/edicoes.service';

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
  selectedPdf: File | null = null;

  constructor(private fb: FormBuilder, private edicoesService: EdicoesService, private router: Router) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.minLength(10)]],
      data: ['', [Validators.required]],
      pdf: ['', [Validators.required]]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedPdf = file;
      this.form.patchValue({ pdf: file.name });
      this.form.get('pdf')?.updateValueAndValidity();
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
      event.target.value = '';
    }
  }

  criarEdicao() {
    if (this.form.valid && this.selectedPdf) {
      this.saving = true;
      
      const formData = new FormData();
      formData.append('titulo', this.form.get('titulo')?.value);
      formData.append('descricao', this.form.get('descricao')?.value);
      formData.append('data', this.form.get('data')?.value);
      formData.append('pdf', this.selectedPdf);

      this.edicoesService.criarEdicao(formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/edicoes']);
        },
        error: (error) => {
          console.error('Erro ao criar edição:', error);
          this.saving = false;
        }
      });
    } else {
      alert('Por favor, preencha todos os campos obrigatórios e selecione um arquivo PDF.');
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

  private markTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }
}