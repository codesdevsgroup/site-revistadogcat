import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

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
  errorMessage = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      identification: ['', [Validators.required, this.emailOrCpfValidator]],
      password: ['', [Validators.required]]
    });
  }

  // Validador personalizado para e-mail ou CPF
  emailOrCpfValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Se estiver vazio, o Validators.required cuidará disso
    }

    const value = control.value.toString().replace(/\D/g, ''); // Remove caracteres não numéricos
    
    // Se tem 11 dígitos, assume que é CPF
    if (value.length === 11) {
      return null; // Aceita como CPF válido (validação básica)
    }
    
    // Caso contrário, valida como e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(control.value)) {
      return null;
    }
    
    return { invalidIdentification: true };
  }

  ngOnInit(): void {
    // Capturar URL de retorno se existir
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
    
    // Se já estiver logado, redirecionar
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const loginData = {
        identification: this.loginForm.get('identification')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            // Redirecionar para a URL de retorno ou admin
            this.router.navigate([this.returnUrl]);
          } else {
            this.errorMessage = response.message || 'Erro no login';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Erro de conexão. Tente novamente.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateToCreatePassword(): void {
    this.router.navigate(['/auth/create-password']);
  }

  navigateToResetPassword(): void {
    this.router.navigate(['/auth/reset-password']);
  }
}
