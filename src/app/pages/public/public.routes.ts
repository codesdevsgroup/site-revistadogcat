import { Routes } from '@angular/router';
import { PublicComponent } from './public';
import { HomeComponent } from './home/home';
import { AssinaturasComponent } from './assinaturas/assinaturas';
import { ExpoDogComponent } from './expo-dog/expo-dog';
import { CadastroCaoComponent } from './cadastro-cao/cadastro-cao';
import { ProfileComponent } from './profile/profile';
import { AuthGuard } from '../../guards/auth.guard';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'assinaturas', component: AssinaturasComponent },
      { path: 'expo-dog', component: ExpoDogComponent },
      { path: 'cadastro-cao', component: CadastroCaoComponent },
      { path: 'perfil', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'area-leitor', redirectTo: '/auth/login', pathMatch: 'full' },
      { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes) }
    ]
  }
];
