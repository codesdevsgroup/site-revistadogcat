import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnderecoService } from '../../services/endereco.service';
import { ProfileService, UserAddress } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Endereco } from '../../interfaces/endereco.interface';
import { TipoEndereco, TIPOS_ENDERECO_OPTIONS } from '../../enums/tipo-endereco.enum';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-modal.html',
  styleUrls: ['./address-modal.scss']
})
export class AddressModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() address: Endereco | null = null; // Para edição
  @Output() closeModal = new EventEmitter<void>();
  @Output() addressSaved = new EventEmitter<Endereco>();

  private fb = inject(FormBuilder);
  private enderecoService = inject(EnderecoService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  addressForm!: FormGroup;
  loading = false;
  loadingCep = false;
  error = '';
  success = '';

  // Opções para tipo de endereço
  tiposEndereco = TIPOS_ENDERECO_OPTIONS;

  ngOnInit() {
    this.initializeForm();
    
    // Se há um endereço para editar, preenche o formulário
    if (this.address) {
      this.populateForm();
    }
  }

  private initializeForm() {
    this.addressForm = this.fb.group({
      tipo: [TipoEndereco.RESIDENCIAL, [Validators.required]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      logradouro: ['', [Validators.required, Validators.minLength(5)]],
      numero: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      principal: [false]
    });
  }

  private populateForm() {
    if (this.address) {
      this.addressForm.patchValue({
        tipo: this.address.tipo,
        cep: this.address.cep,
        logradouro: this.address.logradouro,
        numero: this.address.numero,
        complemento: this.address.complemento || '',
        bairro: this.address.bairro,
        cidade: this.address.cidade,
        estado: this.address.estado,
        principal: this.address.principal
      });
    }
  }

  // Busca endereço por CEP
  onCepBlur() {
    const cep = this.addressForm.get('cep')?.value;
    if (cep && cep.length >= 8) {
      this.buscarEnderecoPorCep(cep);
    }
  }

  private buscarEnderecoPorCep(cep: string) {
    this.loadingCep = true;
    this.error = '';
    
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    this.enderecoService.buscarEnderecoPorCep(cepLimpo).subscribe({
      next: (endereco: any) => {
        if (endereco) {
          // Preenche os campos automaticamente
          this.addressForm.patchValue({
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado
          });
          
          // Foca no campo número
          setTimeout(() => {
            const numeroField = document.getElementById('numero') as HTMLInputElement;
            if (numeroField) {
              numeroField.focus();
            }
          }, 100);
        }
        this.loadingCep = false;
      },
      error: (error: any) => {
        console.error('Erro ao buscar CEP:', error);
        this.error = 'CEP não encontrado. Verifique e tente novamente.';
        this.loadingCep = false;
      }
    });
  }

  // Máscara para CEP
  onCepInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    this.addressForm.get('cep')?.setValue(value);
  }

  // Validação de campos
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.addressForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['pattern']) {
        return 'Formato inválido';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  // Submissão do formulário
  onSubmit() {
    console.log('🔄 onSubmit chamado');
    console.log('📋 Form valid:', this.addressForm.valid);
    console.log('📝 Form value:', this.addressForm.value);
    
    if (this.addressForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const formData = this.addressForm.value;
      console.log('📤 Dados do formulário:', formData);
      
      // Se está editando um endereço existente
      if (this.address?.enderecoId) {
        console.log('✏️ Modo edição - enderecoId:', this.address.enderecoId);
        this.updateAddress(formData);
      } else {
        console.log('➕ Modo criação');
        this.createAddress(formData);
      }
    } else {
      console.log('❌ Formulário inválido');
      console.log('🔍 Erros do formulário:', this.getFormErrors());
      // Marca todos os campos como touched para mostrar erros
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
    }
  }

  private createAddress(formData: any) {
    console.log('🏗️ createAddress iniciado');
    
    // Modo criação - usar EnderecoService
    const newEndereco: Partial<Endereco> = {
      tipo: formData.tipo,
      nome: formData.nome || '',
      logradouro: formData.logradouro,
      numero: formData.numero,
      complemento: formData.complemento || '',
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      cep: formData.cep.replace(/\D/g, ''),
      pontoReferencia: formData.pontoReferencia || '',
      principal: formData.principal
    };

    console.log('📦 Objeto endereco criado:', newEndereco);

    // Obter userId do usuário autenticado
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Current user:', currentUser);
    
    if (!currentUser) {
      console.log('❌ Usuário não autenticado');
      this.error = 'Usuário não autenticado';
      this.loading = false;
      return;
    }

    console.log('🚀 Enviando para API - userId:', currentUser.userId);
    this.enderecoService.createEndereco(currentUser.userId, newEndereco).subscribe({
      next: (response) => {
        console.log('✅ Endereço criado com sucesso:', response);
        this.success = 'Endereço cadastrado com sucesso!';
        this.addressSaved.emit(response);
        
        setTimeout(() => {
          this.onClose();
        }, 1500);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao cadastrar endereço:', error);
        console.error('📄 Detalhes do erro:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        this.error = error.error?.message || 'Erro ao cadastrar endereço. Tente novamente.';
        this.loading = false;
      }
    });
  }

  private updateAddress(formData: any) {
    if (!this.address?.enderecoId) return;
    
    // Modo edição - usar EnderecoService
    const updateData: Partial<Endereco> = {
      enderecoId: this.address.enderecoId,
      tipo: formData.tipo,
      nome: formData.nome || '',
      logradouro: formData.logradouro,
      numero: formData.numero,
      complemento: formData.complemento || '',
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      cep: formData.cep.replace(/\D/g, ''),
      pontoReferencia: formData.pontoReferencia || '',
      principal: formData.principal
    };
    
    this.enderecoService.updateEndereco(this.address.enderecoId, updateData).subscribe({
      next: (response) => {
        this.success = 'Endereço atualizado com sucesso!';
        this.addressSaved.emit(response);
        
        setTimeout(() => {
          this.onClose();
        }, 1500);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar endereço:', error);
        this.error = error.error?.message || 'Erro ao atualizar endereço. Tente novamente.';
        this.loading = false;
      }
    });
  }

  // Fechar modal
  onClose() {
    if (!this.loading) {
      this.closeModal.emit();
      this.resetForm();
    }
  }

  private resetForm() {
    this.addressForm.reset();
    this.addressForm.get('tipo')?.setValue(TipoEndereco.RESIDENCIAL);
    this.addressForm.get('principal')?.setValue(false);
    this.error = '';
    this.success = '';
    this.address = null;
  }

  // Getter para facilitar acesso no template
  get isEditMode(): boolean {
    return !!this.address?.enderecoId;
  }

  // Converte o estado para maiúsculas
  onEstadoInput(event: any): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      const upperValue = target.value.toUpperCase();
      target.value = upperValue;
      this.addressForm.patchValue({ estado: upperValue });
    }
  }

  // Método para debug - obter erros do formulário
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}