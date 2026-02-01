import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Fome Zero</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com" />
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Senha</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (errorMessage()) {
              <p class="error-message">{{ errorMessage() }}</p>
            }

            <button
              mat-raised-button
              color="primary"
              class="full-width"
              type="submit"
              [disabled]="loading() || loginForm.invalid"
            >
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Entrar
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      }
      .login-card {
        width: 100%;
        max-width: 400px;
        padding: 20px;
        background-color: #1e1e1e !important;
      }
      mat-card-header {
        justify-content: center;
        margin-bottom: 20px;
      }
      mat-card-title {
        color: #00bcd4 !important;
        font-size: 28px !important;
      }
      mat-form-field {
        margin-bottom: 16px;
      }
      .error-message {
        color: #ff5252;
        text-align: center;
        margin-bottom: 16px;
      }
      button[type='submit'] {
        height: 48px;
      }
      mat-spinner {
        margin: 0 auto;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;

  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService
      .login(this.loginForm.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Email ou senha inválidos');
        },
      });
  }
}
