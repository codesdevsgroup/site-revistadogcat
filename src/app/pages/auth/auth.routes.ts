import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CreatePasswordComponent } from './create-password/create-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password.component';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'create-password', component: CreatePasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-password', component: ConfirmPasswordComponent }
];