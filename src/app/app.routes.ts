import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AssinaturasComponent } from './pages/assinaturas/assinaturas.component';
import { ExpoDogComponent } from './pages/expo-dog/expo-dog.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'assinaturas', component: AssinaturasComponent },
  { path: 'expo-dog', component: ExpoDogComponent }
];
