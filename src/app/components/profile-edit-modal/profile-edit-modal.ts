import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { ValidationService } from '../../services/validation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit-modal.html',
  styleUrls: ['./profile-edit-modal.scss']
})
export class ProfileEditModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() user: UserProfile | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  profileForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;
  uploadingAvatar = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private validationService: ValidationService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      cpf: ['', [this.validationService.cpfValidator()]],
      birthDate: ['']
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        userName: this.user.userName || '',
        email: this.user.email || '',
        telefone: this.user.telefone || '',
        cpf: this.user.cpf || '',
        birthDate: this.user.birthDate ? this.formatDateForInput(this.user.birthDate) : ''
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    // Converte data do formato ISO para formato de input date (YYYY-MM-DD)
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Formato de arquivo não suportado. Use JPG, PNG ou WebP.';
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Arquivo muito grande. Tamanho máximo: 5MB.';
        return;
      }

      this.selectedAvatarFile = file;
      this.error = '';

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadAvatar(): Promise<string | null> {
    if (!this.selectedAvatarFile) return null;

    this.uploadingAvatar = true;
    try {
      const response = await this.profileService.uploadAvatar(this.selectedAvatarFile).toPromise();
      this.uploadingAvatar = false;
      return response?.avatarUrl || null;
    } catch (error) {
      this.uploadingAvatar = false;
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      let avatarUrl: string | null = null;

      // Upload do avatar se foi selecionado
      if (this.selectedAvatarFile) {
        avatarUrl = await this.uploadAvatar();
      }

      // Preparar dados do perfil
      const formData = this.profileForm.value;
      const profileData: Partial<UserProfile> = {
        name: formData.name,
        userName: formData.userName,
        email: formData.email,
        telefone: formData.telefone || undefined,
        cpf: formData.cpf || undefined,
        birthDate: formData.birthDate || undefined
      };

      // Adicionar avatar URL se foi feito upload
      if (avatarUrl) {
        profileData.avatarUrl = avatarUrl;
      }

      // Atualizar perfil
      const updatedProfile = await this.profileService.updateUserProfile(profileData).toPromise();

      if (updatedProfile) {
        // Atualizar dados do usuário no AuthService
        this.authService.updateUserData(updatedProfile);

        this.success = 'Perfil atualizado com sucesso!';
        this.profileUpdated.emit(updatedProfile);

        setTimeout(() => {
          this.onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      this.error = error.error?.message || 'Erro ao atualizar perfil. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  onClose(): void {
    this.profileForm.reset();
    this.selectedAvatarFile = null;
    this.avatarPreview = null;
    this.error = '';
    this.success = '';
    this.closeModal.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos para validação de campos
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
      if (field.errors['email']) return 'E-mail inválido';
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} inválido`;
      if (field.errors['cpfInvalid']) return 'CPF inválido';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      userName: 'Nome de usuário',
      email: 'E-mail',
      telefone: 'Telefone',
      cpf: 'CPF',
      birthDate: 'Data de nascimento'
    };
    return labels[fieldName] || fieldName;
  }

  // Formatação de telefone
  onTelefoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      this.profileForm.patchValue({ telefone: value });
    }
  }

  // Formatação de CPF
  onCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      this.profileForm.patchValue({ cpf: value });
    }
  }
}
