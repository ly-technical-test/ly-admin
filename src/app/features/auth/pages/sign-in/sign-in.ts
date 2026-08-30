import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SolarArrowRightLinear, SolarLetterLinear } from '@solar-icons/angular';
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
  ],
  selector: 'app-sign-in',
  styleUrls: ['../auth-form.css'],
  templateUrl: './sign-in.html',
})
export class SignIn {
  private readonly authService = inject(AuthService);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(64)],
    }),
  });
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  get emailError(): string | undefined {
    const control = this.form.controls.email;
    return control.invalid && control.touched ? 'Informe um e-mail válido.' : undefined;
  }

  get passwordError(): string | undefined {
    const control = this.form.controls.password;
    return control.invalid && control.touched ? 'Informe sua senha.' : undefined;
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        error: (error: unknown) => this.errorMessage.set(this.errorMessageService.fromHttp(error)),
        next: () => void this.router.navigate(['/dashboard']),
      });
  }
}
