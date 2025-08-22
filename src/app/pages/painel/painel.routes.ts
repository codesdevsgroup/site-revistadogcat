import { Routes } from '@angular/router';
import { PainelComponent } from './painel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ArtigosComponent } from './artigos/artigos.component';

export const painelRoutes: Routes = [
  {
    path: '',
    component: PainelComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'artigos', component: ArtigosComponent }
    ]
  }
];