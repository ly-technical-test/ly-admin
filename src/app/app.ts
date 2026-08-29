import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { NgxNotifier } from 'ngx-notifier';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ly' },
  imports: [CommonModule, NgxNotifier, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) this.loading.set(true);

      if (
        event instanceof NavigationCancel ||
        event instanceof NavigationEnd ||
        event instanceof NavigationError
      ) this.loading.set(false);
    });
  }
}
