import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { ProfileMenu } from '../profile-menu/profile-menu';
import { Subscription } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
  isButton?: boolean;
  buttonClass?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, ProfileMenu],
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
    {
      label: 'Home',
      route: '/'
    },
    {
      label: 'Assinaturas',
      route: '/assinaturas'
    },
    {
      label: 'Expo Dog',
      route: '/expo-dog'
    },
    {
      label: 'Edições',
      route: '/edicoes'
    },
    {
      label: 'Top Canis',
      route: '/top-canis'
    }
  ];

  /**
   * Retorna o item de navegação dinâmico baseado no status de autenticação
   */
  get dynamicNavItem(): NavItem | null {
    if (!this.isAuthenticated) {
      return {
        label: 'Login',
        route: '/auth/login',
        isButton: true,
        buttonClass: 'btn btn-login'
      };
    }
    
    if (this.authService.hasAdminAccess()) {
      return {
        label: 'Painel',
        route: '/admin/dashboard',
        isButton: true,
        buttonClass: 'btn btn-admin'
      };
    }
    
    return null;
  }

  isMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;
  private subscriptions = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Observa mudanças no estado de autenticação
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    // Observa mudanças no usuário atual
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Verifica se deve exibir o menu de perfil para usuários não-administrativos
   */
  shouldShowProfileMenu(): boolean {
    return this.isAuthenticated && 
           this.currentUser !== null && 
           !this.authService.hasAdminAccess();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  trackByRoute(index: number, item: NavItem): string {
    return item.route;
  }
}
