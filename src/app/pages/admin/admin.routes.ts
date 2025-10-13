import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { ArtigosComponent } from './artigos/artigos';
import { ArtigoDetalheComponent } from './artigo-detalhe/artigo-detalhe';
import { AdminEdicoesComponent } from './edicoes/edicoes';
import { EdicaoDetalheComponent } from './edicao-detalhe/edicao-detalhe';
import { AdminGuard } from '../../guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'artigos', component: ArtigosComponent },
      { path: 'artigos/novo', component: ArtigoDetalheComponent },
      { path: 'artigos/:id', component: ArtigoDetalheComponent },
      { path: 'edicoes', component: AdminEdicoesComponent },
      { path: 'edicoes/novo', component: EdicaoDetalheComponent }
    ]
  }
];
