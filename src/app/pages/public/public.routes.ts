import { Routes } from '@angular/router';
import { PublicComponent } from './public';
import { HomeComponent } from './home/home';
import { AssinaturasComponent } from './assinaturas/assinaturas';
import { ExpoDogComponent } from './expo-dog/expo-dog';
import { CadastroCaoComponent } from './cadastro-cao/cadastro-cao';
import { ProfileComponent } from './profile/profile';
import { EdicoesComponent } from './edicoes/edicoes';
import { ArtigosListaComponent } from './artigos/lista/artigos-lista';
import { ArtigoLeituraComponent } from './artigos/detalhe/artigo-leitura';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthResolver } from '../../resolvers/auth.resolver';
import { VotacaoComponent } from './votacao/votacao';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'assinaturas', component: AssinaturasComponent },
      { path: 'expo-dog', component: ExpoDogComponent },
      { path: 'votacao', component: VotacaoComponent },
      { path: 'edicoes', component: EdicoesComponent },
      { path: 'artigos', component: ArtigosListaComponent },
      { path: 'artigos/:id', component: ArtigoLeituraComponent },
      { path: 'cadastro-cao', component: CadastroCaoComponent, canActivate: [AuthGuard], resolve: { auth: AuthResolver } },
      { path: 'perfil', component: ProfileComponent, canActivate: [AuthGuard], resolve: { auth: AuthResolver } },
      { path: 'area-leitor', redirectTo: '/auth/login', pathMatch: 'full' },
      { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes) }
    ]
  }
];
