import { Routes } from '@angular/router';
import { PainelComponent } from './painel';
import { DashboardComponent } from './dashboard/dashboard';
import { UsuariosComponent } from './usuarios/usuarios';
import { ArtigosComponent } from './artigos/artigos';
import { ArtigoDetalheComponent } from './artigo-detalhe/artigo-detalhe';
import { DocumentacaoComponent } from './documentacao/documentacao';

export const painelRoutes: Routes = [
  {
    path: '',
    component: PainelComponent,
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