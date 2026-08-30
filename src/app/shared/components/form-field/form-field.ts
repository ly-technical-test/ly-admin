import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmLabel } from '@spartan-ng/helm/label';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HlmLabel],
  selector: 'app-form-field',
  styleUrl: './form-field.css',
  templateUrl: './form-field.html',
})
export class FormField {
  readonly error = input<string>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
}
