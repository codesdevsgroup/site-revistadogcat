import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rotas públicas
  { path: '', loadChildren: () => import('./pages/public/public.routes').then(m => m.publicRoutes) },
  
  // Rotas privadas/administrativas
  { path: '', loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes) },
  
  // Fallback para rotas não encontradas
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
