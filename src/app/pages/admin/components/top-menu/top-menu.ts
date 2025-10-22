import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Role } from '../../../../enums/role.enum';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-menu.html',
  styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent implements OnInit, OnDestroy {
  userMenuOpen = false;
  username = '';
  userRole = '';
  isScrolled = false;

  constructor(private router: Router, private elementRef: ElementRef, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
    this.checkScrollPosition();
  }

  ngOnDestroy() {
  }

  private loadUserData() {
    try {
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        const user = JSON.parse(userData);
        this.username = user.userName || user.name || '';
        this.userRole = this.translateRole(user.role) || '';
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  private translateRole(role: string): string {
    const roleTranslations: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'EDITOR': 'Editor',
      'FUNCIONARIO': 'Funcionário',
    };
    return roleTranslations[role] || role;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.userMenuOpen) return;
    
    const target = event.target as HTMLElement;
    const menuUserElement = this.elementRef.nativeElement.querySelector('.menu-user');
    
    if (menuUserElement && !menuUserElement.contains(target)) {
      this.userMenuOpen = false;
    }
  }

  private checkScrollPosition() {
    this.isScrolled = window.scrollY > 20;
  }

  logout() {
    this.authService.logout();
  }

  navigateToProfile() {
    this.userMenuOpen = false;
    this.router.navigateByUrl('/perfil');
  }

  navigateToSettings() {
    this.userMenuOpen = false;
    // TODO: Implementar página de configurações
    console.log('Configurações - funcionalidade a ser implementada');
  }

  // Métodos de controle de acesso baseado em roles
  canAccessDashboard(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessUsers(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessDogs(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessArticles(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO, Role.EDITOR]);
  }

  canAccessEditions(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  private hasRole(allowedRoles: Role[]): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    return allowedRoles.includes(user.role as Role);
  }
}
