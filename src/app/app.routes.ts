import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AssinaturasComponent } from './pages/assinaturas/assinaturas';
import { ExpoDogComponent } from './pages/expo-dog/expo-dog';
import { CadastroCaoComponent } from './pages/cadastro-cao/cadastro-cao';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'assinaturas', component: AssinaturasComponent },
  { path: 'expo-dog', component: ExpoDogComponent },
  { path: 'cadastro-cao', component: CadastroCaoComponent },
  { path: 'area-leitor', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'painel', loadChildren: () => import('./pages/painel/painel.routes').then(m => m.painelRoutes) },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes) }
];
