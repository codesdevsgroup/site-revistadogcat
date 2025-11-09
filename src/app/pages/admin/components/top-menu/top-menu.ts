import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './top-menu.html',
  styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent implements OnInit, OnDestroy {
  userMenuOpen = false;
  username = '';
  userRole = '';
  isScrolled = false;
  items: MenuItem[] = [];

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.checkScrollPosition();
    this.buildMenuItems();
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

  // Constrói itens do Menubar com base nas permissões do usuário
  private buildMenuItems() {
    const items: MenuItem[] = [];

    if (this.canAccessDashboard()) {
      items.push({ label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: ['/admin/dashboard'] });
    }
    if (this.canAccessUsers()) {
      items.push({ label: 'Usuários', icon: 'pi pi-users', routerLink: ['/admin/usuarios'] });
    }
    if (this.canAccessDogs()) {
      items.push({ label: 'Cães', icon: 'pi pi-dog', routerLink: ['/admin/caes'] });
    }
    if (this.canAccessArticles()) {
      items.push({ label: 'Artigos', icon: 'pi pi-newspaper', routerLink: ['/admin/artigos'] });
    }
    if (this.canAccessEditions()) {
      items.push({ label: 'Edições', icon: 'pi pi-book', routerLink: ['/admin/edicoes'] });
    }
    if (this.canAccessVotacao()) {
      items.push({ label: 'Votação', icon: 'pi pi-clipboard', routerLink: ['/admin/votacao'] });
    }

    this.items = items;
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

  canAccessVotacao(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  private hasRole(allowedRoles: Role[]): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    return allowedRoles.includes(user.role as Role);
  }
}
