import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../core/auth/auth';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  form!: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      user: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  entrar() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const user = String(this.form.value.user ?? '').trim();
    const password = String(this.form.value.password ?? '');

    this.loading = true;

    this.auth.signInEmail(user, password).subscribe(
      (ok) => {
        if (!ok) {
          this.loading = false;
          this.errorMsg = 'Usuário ou senha inválidos';
          this.cdr.detectChanges();
          return;
        }

        this.auth.getSession().subscribe((sessionOk) => {
          this.loading = false;

          if (!sessionOk) {
            this.errorMsg = 'Sessão não validou (401).';
            this.cdr.detectChanges();
            return;
          }

          this.router.navigateByUrl('/packs');
          this.cdr.detectChanges();
        });
      },
      (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Usuário ou senha inválidos';
        this.cdr.detectChanges();
        return;
      },
    );
  }

  criarConta() {
    this.router.navigateByUrl('/criar-conta');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
