import { Injectable, signal } from '@angular/core';
import { Charge } from '../../features/billing/models/charge.model';

interface Preferences {
  useExternalCheckout: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheckoutPreferencesService {
  private readonly storageKey = 'ly_preferences';
  readonly useExternalCheckout = signal(this.readPreferences().useExternalCheckout);

  getCheckoutLink(charge: Pick<Charge, '_id' | 'linkCheckout'>): string {
    return this.useExternalCheckout()
      ? charge.linkCheckout
      : `${window.location.origin}/external/checkout/${charge._id}`;
  }

  setUseExternalCheckout(value: boolean): void {
    this.useExternalCheckout.set(value);
    localStorage.setItem(this.storageKey, JSON.stringify({ useExternalCheckout: value } satisfies Preferences));
  }

  private readPreferences(): Preferences {
    const value = localStorage.getItem(this.storageKey);
    if (!value) return { useExternalCheckout: false };

    try {
      const preferences: unknown = JSON.parse(value);
      if (this.isPreferences(preferences)) return preferences;
    } catch {}

    return { useExternalCheckout: false };
  }

  private isPreferences(value: unknown): value is Preferences {
    return (
      typeof value === 'object' &&
      value !== null &&
      'useExternalCheckout' in value &&
      typeof value.useExternalCheckout === 'boolean'
    );
  }
}
