import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  SolarCopyLinear,
  SolarCheckCircleLinear,
  SolarAltArrowLeftLinear,
  SolarAltArrowRightLinear,
  SolarMagnifierLinear,
} from '@solar-icons/angular';
import { HlmAlert, HlmAlertDescription } from '@spartan-ng/helm/alert';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { debounceTime, distinctUntilChanged, map, merge, Subject } from 'rxjs';
import { ErrorMessageService } from '../../../../core/errors/error-message.service';
import { CheckoutPreferencesService } from '../../../../core/preferences/checkout-preferences.service';
import { getChargeStatusLabel, getPaymentMethodLabel } from '../../../../shared/utils/charge-labels';
import { CustomersService } from '../../../customers/data-access/customers.service';
import { Customer } from '../../../customers/models/customer.model';
import { BillingService } from '../../data-access/billing.service';
import { Charge } from '../../models/charge.model';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

type ChargeFilter = 'all' | 'paid' | 'pending';

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
    HlmInput,
    HlmSpinner,
    HlmTableImports,
    ReactiveFormsModule,
    ...HlmTooltipImports,
    SolarCopyLinear,
    SolarCheckCircleLinear,
    SolarAltArrowLeftLinear,
    SolarAltArrowRightLinear,
    SolarMagnifierLinear,
  ],
  selector: 'app-charge-list',
  styleUrl: './charge-list.css',
  templateUrl: './charge-list.html',
})
export class ChargeList {
  private readonly billingService = inject(BillingService);
  private readonly customersService = inject(CustomersService);
  private readonly checkoutPreferencesService = inject(CheckoutPreferencesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);

  readonly charges = signal<Charge[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly copiedChargeId = signal<string | null>(null);
  readonly initialLoading = signal(true);
  readonly searching = signal(false);
  readonly selectedFilter = signal<ChargeFilter>('all');
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly immediateSearch = new Subject<string>();
  readonly rows = computed<ChargeRow[]>(() => {
    const customerNames = new Map(this.customers().map(({ _id, name }) => [_id, name]));
    return this.charges().map((charge) => ({
      ...charge,
      customerName: customerNames.get(charge.customer) ?? 'Desconhecido',
    }));
  });

  constructor() {
    this.customersService
      .getCustomers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((customers) => this.customers.set(customers));
    merge(
      this.searchControl.valueChanges.pipe(
        debounceTime(500),
        map((value) => ({ immediate: false, value })),
      ),
      this.immediateSearch.pipe(map((value) => ({ immediate: true, value }))),
    )
      .pipe(
        distinctUntilChanged(
          (previous, current) => !current.immediate && previous.value === current.value,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page.set(1);
        this.searching.set(true);
        this.loadCharges();
      });
    this.loadCharges();
  }

  readonly getChargeStatusLabel = getChargeStatusLabel;
  readonly getPaymentMethodLabel = getPaymentMethodLabel;

  loadCharges(): void {
    this.errorMessage.set(null);

    this.billingService
      .getChargesPage(
        this.searchControl.value.trim(),
        this.page(),
        20,
        this.selectedFilter() === 'all'
          ? undefined
          : (this.selectedFilter().toUpperCase() as 'PAID' | 'PENDING'),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.errorMessage.set(this.errorMessageService.fromHttp(error));
          this.initialLoading.set(false);
          this.searching.set(false);
        },
        next: ({ data, page, total, totalPages }) => {
          this.charges.set(data);
          this.page.set(page);
          this.total.set(total);
          this.totalPages.set(totalPages);
          this.initialLoading.set(false);
          this.searching.set(false);
        },
      });
  }

  setFilter(filter: ChargeFilter): void {
    this.selectedFilter.set(filter);
    this.page.set(1);
    this.loadCharges();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadCharges();
  }

  searchImmediately(): void {
    this.immediateSearch.next(this.searchControl.value);
  }

  async copyPaymentLink(charge: Charge): Promise<void> {
    await navigator.clipboard.writeText(this.checkoutPreferencesService.getCheckoutLink(charge));
    this.copiedChargeId.set(charge._id);
    window.setTimeout(() => this.copiedChargeId.set(null), 1000);
  }
}
