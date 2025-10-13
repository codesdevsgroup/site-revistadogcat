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

  constructor(private fb: FormBuilder, private edicoesService: EdicoesService, private router: Router) {
    const anoAtual = new Date().getFullYear();
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      bimestre: ['', [Validators.required]],
      ano: [anoAtual, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      pdfUrl: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markTouched();
      return;
    }
    this.saving = true;
    const payload = this.form.value;
    this.edicoesService.criarEdicao(payload).subscribe({
      next: () => {
        alert('Edição cadastrada com sucesso!');
        this.router.navigate(['/admin/edicoes']);
      },
      error: (err) => {
        console.error('Erro ao cadastrar edição', err);
        alert('Não foi possível cadastrar a edição. Tente novamente.');
        this.saving = false;
      }
    });
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