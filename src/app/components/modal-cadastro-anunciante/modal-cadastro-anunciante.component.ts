import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-modal-cadastro-anunciante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-cadastro-anunciante.html',
  styleUrls: ['./modal-cadastro-anunciante.scss']
})
export class ModalCadastroAnuncianteComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<any>();

  cadastroForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.cadastroForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telefone: ['', [Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/)]],
      empresa: ['', [Validators.required, Validators.minLength(2)]],
      tipoAnuncio: ['canil', Validators.required],
      mensagem: ['']
    }, { validators: this.emailOrPhoneValidator });
  }

  onClose() {
    this.closeModal.emit();
    this.resetForm();
  }

  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.get('email')?.value;
    const telefone = control.get('telefone')?.value;
    
    if (!email && !telefone) {
      return { emailOrPhoneRequired: true };
    }
    return null;
  }

  onSubmit() {
    if (this.cadastroForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.cadastroForm.value;
      
      // Simular envio (aqui você pode integrar com um serviço real)
      setTimeout(() => {
        this.submitForm.emit(formData);
        this.isSubmitting = false;
        this.onClose();
        alert('Cadastro realizado com sucesso! Entraremos em contato em breve.');
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private resetForm() {
    this.cadastroForm.reset({
      tipoAnuncio: 'canil'
    });
    this.isSubmitting = false;
  }

  private markFormGroupTouched() {
    Object.keys(this.cadastroForm.controls).forEach(key => {
      const control = this.cadastroForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.cadastroForm.get(fieldName);
    
    // Verificar erro de validação customizada para email ou telefone
    if (this.cadastroForm.errors?.['emailOrPhoneRequired'] && this.cadastroForm.touched) {
      if (fieldName === 'email' || fieldName === 'telefone') {
        return 'Preencha pelo menos o email ou telefone';
      }
    }
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cadastroForm.get(fieldName);
    
    // Verificar se há erro de validação customizada para email ou telefone
    if (this.cadastroForm.errors?.['emailOrPhoneRequired'] && this.cadastroForm.touched) {
      if (fieldName === 'email' || fieldName === 'telefone') {
        return true;
      }
    }
    
    return !!(field?.errors && field.touched);
  }
}
