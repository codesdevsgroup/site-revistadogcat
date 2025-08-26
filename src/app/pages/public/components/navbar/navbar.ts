import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileMenu } from '../../../../components/profile-menu/profile-menu';
import { Subscription } from 'rxjs';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface NavItem {
  label: string;
  route: string;
  icon?: string;
  isButton?: boolean;
  buttonClass?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
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
    
    // Temporariamente sem verificação de admin
    return null;
  }

  isMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;
  private subscriptions = new Subscription();

  constructor() {}

  ngOnInit(): void {
    // Temporariamente sem autenticação
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Verifica se deve exibir o menu de perfil para usuários não-administrativos
   */
  shouldShowProfileMenu(): boolean {
    return this.isAuthenticated;
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
