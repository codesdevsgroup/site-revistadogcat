import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProfileService, ProfileData, UserProfile, UserAddress, UserDog } from '../../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  userAddress: UserAddress | null = null;
  userDogs: UserDog[] = [];
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.error = '';

    // Verificar se usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      this.error = 'Usuário não encontrado. Faça login novamente.';
      this.router.navigate(['/auth/login']);
      return;
    }

    // Carregar dados do perfil usando o serviço
    this.profileService.getProfileData().subscribe({
      next: (profileData: ProfileData) => {
        this.user = profileData.user;
        this.userAddress = profileData.address || null;
        this.userDogs = profileData.dogs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);
        this.error = error.message || 'Erro ao carregar dados do perfil.';
        this.loading = false;
        
        // Se erro de autenticação, redirecionar para login
        if (error.message?.includes('Não autorizado') || error.message?.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  refreshProfile(): void {
    this.loadUserProfile();
  }

  onEditProfile(): void {
    // TODO: Implementar navegação para edição de perfil
    console.log('Editar perfil');
  }

  onAddDog(): void {
    this.router.navigate(['/cadastro-cao']);
  }

  onEditDog(dogId: string): void {
    // TODO: Implementar edição de cão
    console.log('Editar cão:', dogId);
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