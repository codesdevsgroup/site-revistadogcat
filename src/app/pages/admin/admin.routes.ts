import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { ArtigosComponent } from './artigos/artigos';
import { ArtigoDetalheComponent } from './artigo-detalhe/artigo-detalhe';
import { DocumentacaoComponent } from './documentacao/documentacao';
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
      { path: 'documentacao', component: DocumentacaoComponent },
      { path: 'documentacao/:doc', component: DocumentacaoComponent }
    ]
  }
];