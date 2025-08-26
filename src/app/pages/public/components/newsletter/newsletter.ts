import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.scss'
})
export class NewsletterComponent implements OnInit {
  newsletterForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

  constructor(private fb: FormBuilder) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  get email() {
    return this.newsletterForm.get('email');
  }

  get acceptTerms() {
    return this.newsletterForm.get('acceptTerms');
  }

  onSubmit() {
    if (this.newsletterForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';
      
      // Simular envio (aqui você integraria com um serviço real)
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitMessage = 'Obrigado! Você foi inscrito com sucesso em nossa newsletter.';
        this.newsletterForm.reset();
        
        // Limpar mensagem após 5 segundos
        setTimeout(() => {
          this.submitMessage = '';
          this.submitSuccess = false;
        }, 5000);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.newsletterForm.controls).forEach(key => {
      const control = this.newsletterForm.get(key);
      control?.markAsTouched();
    });
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'E-mail é obrigatório';
    }
    if (this.email?.hasError('email')) {
      return 'Digite um e-mail válido';
    }
    return '';
  }
}