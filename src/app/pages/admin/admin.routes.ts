import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { ArtigosComponent } from './artigos/artigos';
import { ArtigoDetalheComponent } from './artigo-detalhe/artigo-detalhe';
import { AdminEdicoesComponent } from './edicoes/edicoes';
import { EdicaoDetalheComponent } from './edicao-detalhe/edicao-detalhe';
import { CaesComponent } from './caes/caes';
import { AdminGuard } from '../../guards/admin.guard';
import { RoleBasedGuard } from '../../guards/role-based.guard';
import { AuthResolver } from '../../resolvers/auth.resolver';
import { Role } from '../../enums/role.enum';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    resolve: { auth: AuthResolver },
    children: [
      { 
        path: '', 
        redirectTo: 'artigos', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO] }
      },
      { 
        path: 'usuarios', 
        component: UsuariosComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO] }
      },
      { 
        path: 'artigos', 
        component: ArtigosComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO, Role.EDITOR], allowedForEditor: true }
      },
      { 
        path: 'artigos/:id', 
        component: ArtigoDetalheComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO, Role.EDITOR], allowedForEditor: true }
      },
      { 
        path: 'edicoes', 
        component: AdminEdicoesComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO] }
      },
      { 
        path: 'edicoes/:id', 
        component: EdicaoDetalheComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO] }
      },
      { 
        path: 'caes', 
        component: CaesComponent,
        canActivate: [RoleBasedGuard],
        data: { roles: [Role.ADMIN, Role.FUNCIONARIO] }
      }
    ]
  }
];
