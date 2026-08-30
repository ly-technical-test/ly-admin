import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmCardImports],
  selector: 'app-auth-shell',
  styleUrl: './auth-shell.css',
  templateUrl: './auth-shell.html',
})
export class AuthShell {
  readonly description = input.required<string>();
  readonly title = input.required<string>();
}
