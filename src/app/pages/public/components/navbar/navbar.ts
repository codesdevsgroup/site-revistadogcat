import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import type { Usuario } from '../../../../interfaces/usuario.interface';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly brandConfig = {
    logoSrc: './logo2.png',
    logoAlt: 'Logo DogCat',
    route: '/'
  };

  readonly navigationItems: NavItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Assinaturas', route: '/assinaturas' },
    { label: 'Expo Dog', route: '/expo-dog' },
    { label: 'Edições', route: '/edicoes' },
  ];

  isMenuOpen = false;
  userMenuOpen = false;
  isScrolled = false;
  username = '';
  userRole = '';

  // Observables para o estado de autenticação e dados do usuário
  public isAuthenticated$: Observable<boolean>;
  public currentUser$: Observable<Usuario | null>;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadUserData();
    this.currentUser$.subscribe(user => {
      if (user) {
        this.username = user.userName || user.name || '';
        this.userRole = user.role || ''; // Directly use the role from the user object
      } else {
        this.username = '';
        this.userRole = '';
      }
    });

    // Atualiza estado inicialmente conforme posição da página
    this.updateScrollState();
  }

  ngOnDestroy() {
    // No specific cleanup needed for now, similar to top-menu.ts
  }

  // Controla estado visual (shrink) ao rolar a página
  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateScrollState();
  }

  private updateScrollState() {
    // Ajuste simples: considera scroll > 10px como estado "scrolled"
    this.isScrolled = (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0) > 10;
  }

  private loadUserData() {
    try {
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        const user = JSON.parse(userData);
        this.username = user.userName || user.name || '';
        this.userRole = user.role || ''; // Directly use the role from the user object
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  // Method to check if the user has access to the admin panel
  canAccessAdminPanel(): boolean {
    const allowedRoles = ['ADMIN', 'EDITOR', 'FUNCIONARIO'];
    return allowedRoles.includes(this.userRole);
  }

  private translateRole(role: string): string {
    const roleTranslations: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'EDITOR': 'Editor',
      'FUNCIONARIO': 'Funcionário',
    };
    return roleTranslations[role] || role;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
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

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/'); // Redirect to home after logout
  }

  navigateToProfile() {
    this.userMenuOpen = false;
    this.router.navigateByUrl('/perfil');
  }

  navigateToAdminPanel() {
    this.userMenuOpen = false;
    this.router.navigateByUrl('/admin/dashboard');
  }

  trackByRoute(index: number, item: NavItem): string {
    return item.route;
  }
}
