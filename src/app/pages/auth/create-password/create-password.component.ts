import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss']
})
export class CreatePasswordComponent implements OnInit {
  createPasswordForm: FormGroup;
  isSubmitting = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = {
    score: 0,
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.createPasswordForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      userName: [''],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Inicialização do componente
    // Subscribe to password changes to update strength indicator
    this.createPasswordForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value || '');
    });
  }

  passwordValidator(control: any) {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasLength = value.length >= 8;

    const valid = hasNumber && hasUpper && hasLower && hasSpecial && hasLength;
    if (!valid) {
      return { passwordStrength: true };
    }
    return null;
  }

  updatePasswordStrength(password: string): void {
    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLength = password.length >= 8;

    this.passwordStrength.requirements = {
      length: hasLength,
      uppercase: hasUpper,
      lowercase: hasLower,
      number: hasNumber,
      special: hasSpecial
    };

    const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    this.passwordStrength.score = score;
  }



  getPasswordStrengthClass(): string {
    if (this.passwordStrength.score <= 2) return 'weak';
    if (this.passwordStrength.score <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength.score <= 2) return 'Fraca';
    if (this.passwordStrength.score <= 4) return 'Média';
    return 'Forte';
  }

  passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.createPasswordForm.valid) {
      this.isSubmitting = true;
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = {
        name: this.createPasswordForm.get('name')?.value,
        userName: this.createPasswordForm.get('userName')?.value,
        cpf: this.createPasswordForm.get('cpf')?.value,
        telefone: this.createPasswordForm.get('telefone')?.value,
        email: this.createPasswordForm.get('email')?.value,
        password: this.createPasswordForm.get('password')?.value
      };

      console.log('Create account data:', userData);
      
      // Simular chamada de API
      setTimeout(() => {
        this.isSubmitting = false;
        this.isLoading = false;
        // Redirecionar após criação bem-sucedida
        this.router.navigate(['/auth/login']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createPasswordForm.controls).forEach(key => {
      const control = this.createPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}