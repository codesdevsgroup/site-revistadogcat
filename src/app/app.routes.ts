import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AssinaturasComponent } from './pages/assinaturas/assinaturas.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'assinaturas', component: AssinaturasComponent }
];
