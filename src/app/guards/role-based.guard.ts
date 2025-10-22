import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Role } from '../enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class RoleBasedGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as Role[];
    const allowedForEditor = route.data['allowedForEditor'] as boolean;

    if (this.authService.isAuthenticated()) {
      return this.checkAccess(requiredRoles, allowedForEditor);
    }

    console.log('RoleBasedGuard: Usuário não autenticado, tentando refresh token...');
    return this.authService.ensureAuthenticated().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return this.checkAccessSync(requiredRoles, allowedForEditor);
        } else {
          console.log('RoleBasedGuard: Falha na autenticação, redirecionando para login.');
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.log('RoleBasedGuard: Erro durante autenticação, redirecionando para login.', error);
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }

  private checkAccess(requiredRoles: Role[], allowedForEditor: boolean): Observable<boolean> {
    return of(this.checkAccessSync(requiredRoles, allowedForEditor));
  }

  private checkAccessSync(requiredRoles: Role[], allowedForEditor: boolean): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      console.log('RoleBasedGuard: Usuário não encontrado.');
      this.router.navigate(['/auth/login']);
      return false;
    }

    const userRole = user.role as Role;

    // Se não há roles específicas definidas, permite acesso para qualquer role administrativa
    if (!requiredRoles || requiredRoles.length === 0) {
      if (this.authService.hasAdminAccess()) {
        return true;
      } else {
        console.log('RoleBasedGuard: Usuário sem permissão administrativa.');
        this.router.navigate(['/']);
        return false;
      }
    }

    // Verifica se o usuário tem uma das roles necessárias
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Verifica se é um editor tentando acessar uma rota permitida para editores
    if (userRole === Role.EDITOR && allowedForEditor) {
      return true;
    }

    // Se chegou até aqui, não tem permissão
    console.log(`RoleBasedGuard: Usuário com role ${userRole} não tem permissão para acessar esta rota.`);
    
    // Se é um editor, redireciona para artigos (única seção permitida)
    if (userRole === Role.EDITOR) {
      this.router.navigate(['/admin/artigos']);
      return false;
    }

    // Para outros casos, redireciona para home
    this.router.navigate(['/']);
    return false;
  }
}