import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      identification: ['', [Validators.required, this.emailOrCpfValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const loginData = {
        identification: this.loginForm.get('identification')?.value,
        password: this.loginForm.get('password')?.value
      };

      console.log('Login data:', loginData);
      
      // Simular chamada de API
      setTimeout(() => {
        this.isSubmitting = false;
        // Redirecionar para o painel após login bem-sucedido
        this.router.navigate(['/admin']);
      }, 2000);
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
