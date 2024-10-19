import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { ArtigosComponent } from './artigos/artigos';
import { ArtigoDetalheComponent } from './artigo-detalhe/artigo-detalhe';
import { AdminEdicoesComponent } from './edicoes/edicoes';
import { EdicaoDetalheComponent } from './edicao-detalhe/edicao-detalhe';
import { AdminGuard } from '../../guards/admin.guard';
import { AuthResolver } from '../../resolvers/auth.resolver';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    resolve: { auth: AuthResolver },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'artigos', component: ArtigosComponent },
      { path: 'artigos/:id', component: ArtigoDetalheComponent },
      { path: 'edicoes', component: AdminEdicoesComponent },
      { path: 'edicoes/:id', component: EdicaoDetalheComponent }
    ]
  }
];
