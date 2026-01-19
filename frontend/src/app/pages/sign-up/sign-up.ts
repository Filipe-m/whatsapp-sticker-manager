import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../../core/auth/auth';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css'],
})
export class SignUpComponent {
  form!: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        rememberMe: [true],
      },
      { validators: [passwordMatchValidator] }
    );
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  criarConta() {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
      this.cdr.detectChanges();
    }

    const name = String(this.form.value.name ?? '').trim();
    const email = String(this.form.value.email ?? '').trim();
    const password = String(this.form.value.password ?? '');
    const rememberMe = Boolean(this.form.value.rememberMe);

    this.auth.signUpEmailFull({
        name,
        email,
        password,
        rememberMe,
    });

    this.loading = true;

    this.auth
      .signUpEmailFull({
        name,
        email,
        password,
        rememberMe,
      })
      .subscribe({
        next: (ok) => {
          this.loading = false;

          if (!ok) {
            this.errorMsg = 'Não foi possível criar a conta. Verifique os dados.';
            this.cdr.detectChanges();
            return;
          }

          // ✅ cadastrado no banco -> volta para login
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.message || 'Não foi possível criar a conta.';
          this.cdr.detectChanges();
          return;
          
        },
      });
  }

  voltar() {
    this.router.navigateByUrl('/');
  }
}
