import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ResetPasswordComponent } from './reset-password/reset-password';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-password', component: ConfirmPasswordComponent },
];
