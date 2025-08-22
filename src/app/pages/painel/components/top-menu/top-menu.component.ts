import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent {
  userMenuOpen = false;

  constructor(private router: Router) {}

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    // Lógica de logout será implementada depois
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile() {
    // Navegação para perfil
    console.log('Navegar para perfil');
  }

  navigateToSettings() {
    // Navegação para configurações
    console.log('Navegar para configurações');
  }
}