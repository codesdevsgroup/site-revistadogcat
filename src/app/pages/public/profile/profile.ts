import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, UserProfile } from '../../../services/profile.service';
import { Endereco } from '../../../interfaces/endereco.interface';
import { ProfileEditModalComponent } from '../../../components/profile-edit-modal/profile-edit-modal';
import { AddressModalComponent } from '../../../components/address-modal/address-modal';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileEditModalComponent, AddressModalComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  loading = true;
  error = '';

  isProfileEditModalOpen = false;
  isAddressModalOpen = false;
  currentEditingAddress: Endereco | null = null;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadInitialData(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.userId) {
      this.error = 'Usuário não encontrado. Faça login novamente.';
      this.router.navigate(['/auth/login']);
      return;
    }

    const profileSub = this.profileService.getProfileData().subscribe({
      next: (profile) => {
        this.user = profile;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [ProfileComponent] Erro ao carregar dados do perfil:', err);
        this.error = err.message || 'Erro ao carregar a página.';
        this.loading = false;
      }
    });

    this.subscriptions.add(profileSub);
  }

  openProfileEditModal(): void {
    this.isProfileEditModalOpen = true;
  }

  closeProfileEditModal(): void {
    this.isProfileEditModalOpen = false;
  }

  onProfileUpdated(updatedUser: UserProfile): void {
    if (this.user) {
      this.user = { ...this.user, ...updatedUser };
    }
    this.closeProfileEditModal();
    this.loadInitialData();
  }

  openAddressModal(endereco?: Endereco): void {
    this.currentEditingAddress = endereco || null;
    this.isAddressModalOpen = true;
  }

  closeAddressModal(): void {
    this.isAddressModalOpen = false;
    this.currentEditingAddress = null;
  }

  onAddressSaved(savedAddress: Endereco): void {
    const userId = this.authService.getCurrentUser()?.userId;
    this.closeAddressModal();
  }

  onEditProfile(): void {
    this.openProfileEditModal();
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'EDITOR': 'Editor',
      'FUNCIONARIO': 'Funcionário',
      'USER': 'Usuário'
    };
    return roleMap[role] || role;
  }
}
