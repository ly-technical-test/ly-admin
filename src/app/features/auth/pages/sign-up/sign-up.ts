import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SolarArrowRightLinear, SolarLetterLinear, SolarUserLinear } from '@solar-icons/angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ErrorMessageService } from '../../../../core/errors/error-message.service';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { PasswordField } from '../../../../shared/components/password-field/password-field';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AuthShell,
    CommonModule,
    FormField,
    HlmButton,
    HlmInput,
    HlmSpinner,
    PasswordField,
    ReactiveFormsModule,
    RouterLink,
    SolarArrowRightLinear,
    SolarLetterLinear,
    SolarUserLinear,
  ],
  selector: 'app-sign-up',
  styleUrls: ['../auth-form.css'],
  templateUrl: './sign-up.html',
})
export class SignUp {
  private readonly authService = inject(AuthService);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(128)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
    }),
  });
  readonly submitting = signal(false);

  get emailError(): string | undefined {
    const control = this.form.controls.email;
    return control.invalid && control.touched ? 'Informe um e-mail válido.' : undefined;
  }

  get nameError(): string | undefined {
    const control = this.form.controls.name;
    return control.invalid && control.touched
      ? 'Informe um nome com pelo menos 2 caracteres.'
      : undefined;
  }

  get passwordError(): string | undefined {
    const control = this.form.controls.password;
    return control.invalid && control.touched
      ? 'Use uma senha entre 8 e 64 caracteres.'
      : undefined;
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService
      .register(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        error: (error: unknown) => this.errorMessage.set(this.errorMessageService.fromHttp(error)),
        next: () => void this.router.navigate(['/dashboard']),
      });
  }
}
