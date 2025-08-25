import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-menu.html',
  styleUrls: ['./profile-menu.scss']
})
export class ProfileMenu implements OnInit {
  user: User | null = null;
  isDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  goToProfile(): void {
    this.closeDropdown();
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }

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