import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent implements OnInit {
  user: User | null = null;
  isDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  /**
   * Alterna a visibilidade do dropdown
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Fecha o dropdown
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * Navega para a página de perfil (futuramente implementada)
   */
  goToProfile(): void {
    this.closeDropdown();
    // TODO: Implementar navegação para página de perfil
    console.log('Navegação para perfil será implementada futuramente');
  }

  /**
   * Realiza logout (futuramente implementado)
   */
  logout(): void {
    this.closeDropdown();
    // TODO: Implementar funcionalidade de logout
    console.log('Funcionalidade de logout será implementada futuramente');
  }

  /**
   * Obtém as iniciais do nome do usuário para exibir no avatar
   */
  getUserInitials(): string {
    if (!this.user?.name) {
      return 'U';
    }
    
    const names = this.user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Obtém a descrição da role do usuário
   */
  getUserRoleDescription(): string {
    if (!this.user?.role) {
      return 'Usuário';
    }
    
    switch (this.user.role) {
      case 'USUARIO':
        return 'Usuário';
      case 'DONO_PET_APROVADO':
        return 'Dono de Pet';
      case 'ASSINANTE':
        return 'Assinante';
      case 'DONO_PET_APROVADO_ASSINANTE':
        return 'Assinante Premium';
      default:
        return 'Usuário';
    }
  }
}