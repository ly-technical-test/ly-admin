import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, HlmCardImports],
  selector: 'app-metric-card',
  styleUrl: './metric-card.css',
  templateUrl: './metric-card.html',
})
export class MetricCard {
  readonly amount = input.required<number>();
  readonly caption = input.required<string>();
  readonly label = input.required<string>();
  readonly tone = input.required<'primary' | 'success' | 'warning'>();
}
