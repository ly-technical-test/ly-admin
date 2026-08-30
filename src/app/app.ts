import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
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
import { LoadingScreen } from './shared/components/loading-screen/loading-screen';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ly' },
  imports: [CommonModule, LoadingScreen, NgxNotifier, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) this.loading.set(true);

      if (event instanceof NavigationEnd) {
        this.loading.set(false);
        this.updateDescription();
      }

      if (event instanceof NavigationCancel || event instanceof NavigationError) this.loading.set(false);
    });
  }

  private updateDescription(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;

    const description = route.data['description'] as string | undefined;
    if (description) this.meta.updateTag({ content: description, name: 'description' });
  }
}
