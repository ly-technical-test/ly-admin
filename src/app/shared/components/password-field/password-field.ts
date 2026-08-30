import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SolarEyeClosedLinear, SolarEyeLinear, SolarLockLinear } from '@solar-icons/angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { FormField } from '../form-field/form-field';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormField,
    HlmButton,
    HlmInput,
    ReactiveFormsModule,
    SolarEyeClosedLinear,
    SolarEyeLinear,
    SolarLockLinear,
  ],
  selector: 'app-password-field',
  styleUrl: './password-field.css',
  templateUrl: './password-field.html',
})
export class PasswordField {
  readonly autocomplete = input.required<'current-password' | 'new-password'>();
  readonly control = input.required<FormControl<string>>();
  readonly error = input<string>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly visible = signal(false);

  toggleVisibility(): void {
    this.visible.update((value) => !value);
  }
}
