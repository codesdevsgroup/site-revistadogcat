import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
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
export class ProfileEditModalComponent implements OnInit, OnChanges {
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
      cpf: ['', [this.validationService.cpfValidator()] ],
    });
  }

  ngOnInit(): void {
    this.populateForm();
  }

  ngOnChanges(): void {
    this.populateForm();
  }

  private populateForm(): void {
    if (this.user && this.isOpen) {
      this.profileForm.patchValue({
        name: this.user.name || '',
        userName: this.user.userName || '',
        email: this.user.email || '',
        telefone: this.user.telefone || '',
        cpf: this.user.cpf || '',
      });
      this.avatarPreview = this.user.avatarUrl || null;
    }
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Formato de arquivo não suportado. Use JPG, PNG ou WebP.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Arquivo muito grande. Tamanho máximo: 5MB.';
        return;
      }
      this.selectedAvatarFile = file;
      this.error = '';
      const reader = new FileReader();
      reader.onload = (e) => { this.avatarPreview = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  async uploadAvatar(): Promise<string | null> {
    if (!this.selectedAvatarFile) return null;
    this.uploadingAvatar = true;
    try {
      const response = await lastValueFrom(this.profileService.uploadAvatar(this.selectedAvatarFile));
      return response?.avatarUrl || null;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    } finally {
      this.uploadingAvatar = false;
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
      let avatarUrl: string | null = this.user?.avatarUrl || null;
      if (this.selectedAvatarFile) {
        avatarUrl = await this.uploadAvatar();
      }
      const formData = this.profileForm.value;
      const profileData: Partial<UserProfile> = {
        name: formData.name,
        userName: formData.userName,
        email: formData.email,
        telefone: formData.telefone || undefined,
        cpf: formData.cpf || undefined,
        avatarUrl: avatarUrl || undefined
      };
      const updatedProfile = await lastValueFrom(this.profileService.updateUserProfile(profileData));
      if (updatedProfile) {
        this.authService.updateUserData(updatedProfile);
        this.success = 'Perfil atualizado com sucesso!';
        this.profileUpdated.emit(updatedProfile);
        setTimeout(() => { this.onClose(); }, 1500);
      }
    } catch (error: any) {
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
    Object.values(this.profileForm.controls).forEach(control => control.markAsTouched());
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors || !(field.dirty || field.touched)) return '';
    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório.`;
    if (field.errors['email']) return 'E-mail inválido.';
    if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres.`;
    if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} inválido.`;
    if (field.errors['cpfInvalid']) return 'CPF inválido.';
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    return { name: 'Nome', userName: 'Nome de usuário', email: 'E-mail', telefone: 'Telefone', cpf: 'CPF' }[fieldName] || fieldName;
  }

  onTelefoneInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '');
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 6) {
      const part2 = value.substring(2);
      const separatorIndex = part2.length > 5 ? 5 : 4;
      formattedValue = `(${value.substring(0, 2)}) ${part2.substring(0, separatorIndex)}-${part2.substring(separatorIndex, 9)}`;
    }
    event.target.value = formattedValue;
  }

  onCpfInput(event: any): void {
    const value = event.target.value.replace(/\D/g, '');
    let formattedValue = value;
    if (value.length > 3) formattedValue = `${value.substring(0, 3)}.${value.substring(3)}`;
    if (value.length > 6) formattedValue = `${formattedValue.substring(0, 7)}.${value.substring(7)}`;
    if (value.length > 9) formattedValue = `${formattedValue.substring(0, 11)}-${value.substring(11, 13)}`;
    event.target.value = formattedValue.substring(0, 14);
  }
}
