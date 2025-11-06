import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-login-required-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-required-modal.component.html',
  styleUrl: './login-required-modal.component.scss'
})
export class LoginRequiredModalComponent {
  @Input() returnUrl: string = '/';
  
  constructor(private router: Router) {}
  
  /**
   * Exibe o modal de login necessário
   */
  show(): void {
    const modalElement = document.getElementById('loginRequiredModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  
  /**
   * Oculta o modal de login necessário
   */
  hide(): void {
    const modalElement = document.getElementById('loginRequiredModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  
  /**
   * Redireciona para a página de login
   */
  redirectToLogin(): void {
    this.hide();
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }
}