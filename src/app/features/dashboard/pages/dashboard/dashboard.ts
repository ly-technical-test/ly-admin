import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  SolarAltArrowRightLinear,
  SolarCheckCircleLinear,
  SolarClockCircleLinear,
  SolarWalletLinear,
} from '@solar-icons/angular';
import { HlmAlert, HlmAlertDescription } from '@spartan-ng/helm/alert';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { forkJoin } from 'rxjs';
import { ErrorMessageService } from '../../../../core/errors/error-message.service';
import {
  getChargeStatusLabel,
  getPaymentMethodLabel,
} from '../../../../shared/utils/charge-labels';
import { BillingService } from '../../../billing/data-access/billing.service';
import { Charge } from '../../../billing/models/charge.model';
import { CustomersService } from '../../../customers/data-access/customers.service';
import { Customer } from '../../../customers/models/customer.model';
import { MetricCard } from '../../components/metric-card/metric-card';

interface ChargeRow extends Charge {
  customerName: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HlmAlert,
    HlmAlertDescription,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmSpinner,
    HlmTableImports,
    MetricCard,
    RouterLink,
    SolarAltArrowRightLinear,
    SolarCheckCircleLinear,
    SolarClockCircleLinear,
    SolarWalletLinear,
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly billingService = inject(BillingService);
  private readonly customersService = inject(CustomersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);

  readonly charges = signal<Charge[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly loading = signal(true);

  readonly paidCharges = computed(() => this.charges().filter(({ status }) => status === 'PAID'));
  readonly pendingCharges = computed(() =>
    this.charges().filter(({ status }) => status !== 'PAID'),
  );
  readonly paidTotal = computed(() => this.sumAmounts(this.paidCharges()));
  readonly pendingTotal = computed(() => this.sumAmounts(this.pendingCharges()));
  readonly totalIssued = computed(() => this.sumAmounts(this.charges()));
  readonly rows = computed<ChargeRow[]>(() => {
    const customerNames = new Map(this.customers().map(({ _id, name }) => [_id, name]));
    return this.charges()
      .map((charge) => ({
        ...charge,
        customerName: customerNames.get(charge.customer) ?? 'Desconhecido',
      }))
      .slice(0, 6);
  });

  constructor() {
    this.loadDashboard();
  }

  readonly getChargeStatusLabel = getChargeStatusLabel;
  readonly getPaymentMethodLabel = getPaymentMethodLabel;

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.charges.set([]);
    this.customers.set([]);

    forkJoin({
      charges: this.billingService.getCharges(),
      customers: this.customersService.getCustomers(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.errorMessage.set(this.errorMessageService.fromHttp(error));
          this.loading.set(false);
        },
        next: ({ charges, customers }) => {
          this.charges.set(charges);
          this.customers.set(customers);
          this.loading.set(false);
        },
      });
  }

  private sumAmounts(charges: Charge[]): number {
    return charges.reduce((total, { amount }) => total + amount, 0);
  }
}
