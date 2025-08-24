import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
  isButton?: boolean;
  buttonClass?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
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
    },
    {
      label: 'Área do Leitor',
      route: '/area-leitor',
      isButton: true,
      buttonClass: 'btn btn-login'
    }
  ];

  isMenuOpen = false;

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
