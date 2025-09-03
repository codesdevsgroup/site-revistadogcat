import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  @Input() address: Endereco | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() addressSaved = new EventEmitter<Endereco>();

  private fb = inject(FormBuilder);
  addressForm!: FormGroup;
  loading = false; // Manter para feedback visual, se necessário
  loadingCep = false;
  error = '';
  success = '';

  tiposEndereco = TIPOS_ENDERECO_OPTIONS;

  ngOnInit() {
    this.initializeForm();
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
      this.addressForm.patchValue(this.address);
    }
  }

  onCepBlur() {
    const cep = this.addressForm.get('cep')?.value;
    if (cep && cep.length >= 8) {
      this.buscarEnderecoPorCep(cep);
    }
  }

  private buscarEnderecoPorCep(cep: string) {
    this.loadingCep = true;
    this.error = '';
    cep.replace(/\D/g, '');
// A lógica de busca de CEP via API externa (ViaCEP) deve ser implementada aqui ou em um novo serviço,
    // se ainda for necessária, já que o EnderecoService foi removido.
    // Por enquanto, apenas limpa o CEP.
    this.loadingCep = false; // Desativar loading, pois não há chamada externa
  }

  onCepInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    event.target.value = value;
  }

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

  onSubmit() {
    if (this.addressForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';
      const formData: Endereco = this.addressForm.value; // Tipar formData como Endereco

      // Como o endpoint de endereços foi removido, o modal agora apenas emite os dados do formulário.
      this.success = 'Dados do endereço prontos para uso!';
      this.addressSaved.emit(formData); // Emite os dados do formulário
      setTimeout(() => {
        this.loading = false;
        this.onClose();
      }, 500); // Pequeno delay para feedback visual
    } else {
      Object.values(this.addressForm.controls).forEach(control => control.markAsTouched());
    }
  }

  onClose() {
    if (!this.loading) {
      this.closeModal.emit();
      this.resetForm();
    }
  }

  private resetForm() {
    this.addressForm.reset({ tipo: TipoEndereco.RESIDENCIAL, principal: false });
    this.error = '';
    this.success = '';
    this.address = null;
  }

  get isEditMode(): boolean {
    return !!this.address?.enderecoId;
  }

  onEstadoInput(event: any): void {
    const target = event.target as HTMLInputElement;
    target.value = target.value.toUpperCase();
  }
}
