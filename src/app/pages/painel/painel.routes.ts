import { Routes } from '@angular/router';
import { PainelComponent } from './painel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ArtigosComponent } from './artigos/artigos.component';
import { ArtigoDetalheComponent } from './artigo-detalhe/artigo-detalhe.component';
import { DocumentacaoComponent } from './documentacao/documentacao.component';

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