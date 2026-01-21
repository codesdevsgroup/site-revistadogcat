import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Role } from '../../../../enums/role.enum';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() linkClicked = new EventEmitter<void>();
  items: MenuItem[] = [];
  currentRoute: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  ngOnInit() {
    this.buildMenuItems();
    this.currentRoute = this.router.url;
  }

  onLinkClick() {
    this.linkClicked.emit();
  }

  private buildMenuItems() {
    const items: MenuItem[] = [];

    if (this.canAccessDashboard()) {
      items.push({ label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: '/admin/dashboard' });
    }
    if (this.canAccessUsers()) {
      items.push({ label: 'Usuários', icon: 'pi pi-users', routerLink: '/admin/usuarios' });
    }
    if (this.canAccessDogs()) {
      items.push({ label: 'Cães', icon: 'pi pi-heart', routerLink: '/admin/caes' });
    }
    if (this.canAccessArticles()) {
      items.push({ label: 'Artigos', icon: 'pi pi-file-edit', routerLink: '/admin/artigos' });
    }
    if (this.canAccessEditions()) {
      items.push({ label: 'Edições da Revista', icon: 'pi pi-book', routerLink: '/admin/edicoes' });
    }
    if (this.canAccessVotacao()) {
      items.push({ label: 'Votação', icon: 'pi pi-clipboard', routerLink: '/admin/votacao' });
    }
    if (this.canAccessConfiguracaoTaxa()) {
      items.push({ label: 'Configuração de Taxa', icon: 'pi pi-cog', routerLink: '/admin/configuracao-taxa' });
    }

    this.items = items;
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  // Métodos de controle de acesso baseado em roles
  canAccessDashboard(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessUsers(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessDogs(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessArticles(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO, Role.EDITOR]);
  }

  canAccessEditions(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessVotacao(): boolean {
    return this.hasRole([Role.ADMIN, Role.FUNCIONARIO]);
  }

  canAccessConfiguracaoTaxa(): boolean {
    return this.hasRole([Role.ADMIN]);
  }

  private hasRole(allowedRoles: Role[]): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    return allowedRoles.includes(user.role as Role);
  }
}
