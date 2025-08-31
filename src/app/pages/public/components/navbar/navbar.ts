import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileMenu } from '../../../../components/profile-menu/profile-menu';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, ProfileMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
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
    { label: 'Top Canis', route: '/top-canis' }
  ];

  isMenuOpen = false;

  // Observables para o estado de autenticação e dados do usuário
  public isAuthenticated$: Observable<boolean>;
  public currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
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
