import { Component, HostListener, ElementRef } from '@angular/core';
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

  constructor(private router: Router, private elementRef: ElementRef) {}

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.userMenuOpen) return;
    
    const target = event.target as HTMLElement;
    const menuUserElement = this.elementRef.nativeElement.querySelector('.menu-user');
    
    // Verifica se o clique foi fora do menu do usuário
    if (menuUserElement && !menuUserElement.contains(target)) {
      this.userMenuOpen = false;
    }
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