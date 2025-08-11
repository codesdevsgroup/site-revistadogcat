import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AssinaturasComponent } from './pages/assinaturas/assinaturas.component';
import { ExpoDogComponent } from './pages/expo-dog/expo-dog.component';
import { CadastroCaoComponent } from './pages/cadastro-cao/cadastro-cao.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'assinaturas', component: AssinaturasComponent },
  { path: 'expo-dog', component: ExpoDogComponent },
  { path: 'cadastro-cao', component: CadastroCaoComponent }
];
