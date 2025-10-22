import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';
import { ValidationService } from '../../../../services/validation.service'; // Importado

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  returnUrl = '';
  // A propriedade errorMessage não é mais necessária

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
    private validationService: ValidationService
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, this.emailOrCpfValidator.bind(this)]],
      password: ['', [Validators.required]]
    });
  }

  emailOrCpfValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Verifica se é um email válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(value)) {
      return null;
    }

    // Verifica se é um CPF válido usando a validação centralizada
    const cpfValidationResult = this.validationService.cpfValidator()(control);
    if (cpfValidationResult === null) {
      return null;
    }

    return { invalidIdentifier: true };
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultRedirectUrl();
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const loginData = {
      identification: this.loginForm.get('identification')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const redirectUrl = this.returnUrl === this.getDefaultRedirectUrl()
          ? this.getRedirectUrlByRole()
          : this.returnUrl;
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        this.isSubmitting = false;
        // Chama o serviço de notificação em caso de erro
        this.notificationService.error('E-mail ou senha inválidos. Por favor, tente novamente.');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private getDefaultRedirectUrl(): string {
    return '/admin';
  }

  private getRedirectUrlByRole(): string {
    const user = this.authService.getCurrentUser();
    if (this.authService.hasAdminAccess()) {
      return '/admin';
    }
    return '/';
  }

  navigateToCreatePassword(): void {
    this.router.navigate(['/auth/create-password']);
  }

  navigateToResetPassword(): void {
    this.router.navigate(['/auth/reset-password']);
  }
}
