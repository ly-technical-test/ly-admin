import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import {
  SolarAddCircleLinear,
  SolarCloseCircleLinear,
  SolarHamburgerMenuLinear,
  SolarLogout2Linear,
  SolarUsersGroupRoundedLinear,
  SolarWalletMoneyLinear,
  SolarWidget5Linear,
} from '@solar-icons/angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { AuthService } from '../../auth/auth.service';
import { UserProfile } from '../../auth/profile.models';
import { ProfileService } from '../../auth/profile.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HlmButton,
    HlmSpinner,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SolarAddCircleLinear,
    SolarCloseCircleLinear,
    SolarHamburgerMenuLinear,
    SolarLogout2Linear,
    SolarUsersGroupRoundedLinear,
    SolarWalletMoneyLinear,
    SolarWidget5Linear,
  ],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly pageTitle = signal('Dashboard');
  readonly profile = signal<UserProfile | null>(null);
  readonly profileLoading = signal(true);

  constructor() {
    this.updatePageTitle();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updatePageTitle());

    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed())
      .subscribe({
        error: () => this.profileLoading.set(false),
        next: (profile) => {
          this.profile.set(profile);
          this.profileLoading.set(false);
        },
      });
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  private updatePageTitle(): void {
    let route = this.router.routerState.snapshot.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.pageTitle.set((route.data['pageTitle'] as string | undefined) ?? 'Dashboard');
  }
}
