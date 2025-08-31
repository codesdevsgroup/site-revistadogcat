import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-menu.html',
  styleUrls: ['./profile-menu.scss']
})
export class ProfileMenu implements OnInit {
  @Input() context: 'public' | 'admin' = 'public';
  @Input() showUserInfo: boolean = true;

  user: User | null = null;
  isDropdownOpen = false;
  canAccessAdminPanel = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.canAccessAdminPanel = this.authService.hasAdminAccess();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.isDropdownOpen) return;

    const target = event.target as HTMLElement;
    const profileMenuElement = this.elementRef.nativeElement;

    if (profileMenuElement && !profileMenuElement.contains(target)) {
      this.isDropdownOpen = false;
    }
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

  goToAdminPanel(): void {
    this.closeDropdown();
    this.router.navigate(['/admin']);
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

    if (this.context === 'admin') {
      switch (this.user.role) {
        case 'ADMIN': return 'Administrador';
        case 'EDITOR': return 'Editor';
        case 'FUNCIONARIO': return 'Funcionário';
        default: return 'Usuário';
      }
    }

    switch (this.user.role) {
      case 'USUARIO': return 'Usuário';
      case 'DONO_PET_APROVADO': return 'Dono de Pet';
      case 'ASSINANTE': return 'Assinante';
      case 'DONO_PET_APROVADO_ASSINANTE': return 'Assinante Premium';
      default: return 'Administrador';
    }
  }

  // Método adicionado de volta para corrigir o erro de build
  isAdminContext(): boolean {
    return this.context === 'admin';
  }
}
