import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Verifica se o usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Verifica se o usuário tem acesso administrativo
    if (this.authService.hasAdminAccess()) {
      return true;
    }

    // Se não tem permissão, redireciona para página de acesso negado ou home
    this.router.navigate(['/']);
    return false;
  }
}