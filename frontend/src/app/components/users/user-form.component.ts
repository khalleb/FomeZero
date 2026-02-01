import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Novo' }} Usuário</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Senha{{ data ? ' (deixe em branco para manter)' : '' }}</mat-label>
          <input matInput formControlName="password" type="password">
          @if (!data && form.get('password')?.hasError('required')) {
            <mat-hint>A senha é obrigatória para novos usuários</mat-hint>
          }
        </mat-form-field>

        @if (data) {
          <div class="toggle-field">
            <mat-slide-toggle formControlName="active">Ativo</mat-slide-toggle>
          </div>
        }
      </form>

      @if (errorMessage()) {
        <p class="error-message">{{ errorMessage() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()" [disabled]="saving()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Salvar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .toggle-field {
      margin: 16px 0;
    }
    .error-message {
      color: #f44336;
      margin-top: 16px;
      text-align: center;
    }
  `]
})
export class UserFormComponent {
  form: FormGroup;
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: ['', data ? [] : Validators.required],
      active: [data?.active ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.errorMessage.set('');

    if (this.data) {
      const request: UpdateUserRequest = {
        name: this.form.value.name,
        email: this.form.value.email,
        active: this.form.value.active
      };

      if (this.form.value.password) {
        request.password = this.form.value.password;
      }

      this.userService.update(this.data.id!, request)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: () => this.errorMessage.set('Erro ao atualizar usuário. Verifique se o email já está em uso.')
        });
    } else {
      const request: CreateUserRequest = {
        name: this.form.value.name,
        email: this.form.value.email,
        password: this.form.value.password
      };

      this.userService.create(request)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: () => this.errorMessage.set('Erro ao criar usuário. Verifique se o email já está em uso.')
        });
    }
  }
}
