import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SolarAltArrowLeftLinear, SolarAltArrowRightLinear, SolarMagnifierLinear } from '@solar-icons/angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAlert, HlmAlertDescription } from '@spartan-ng/helm/alert';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subject, switchMap } from 'rxjs';
import { ErrorMessageService } from '../../../../core/errors/error-message.service';
import { CustomersService } from '../../data-access/customers.service';
import { Customer } from '../../models/customer.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HlmAlert,
    HlmAlertDescription,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSpinner,
    HlmTableImports,
    ReactiveFormsModule,
    SolarMagnifierLinear,
    SolarAltArrowLeftLinear,
    SolarAltArrowRightLinear,
  ],
  selector: 'app-customer-list',
  styleUrl: './customer-list.css',
  templateUrl: './customer-list.html',
})
export class CustomerList {
  private readonly customersService = inject(CustomersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);

  readonly customers = signal<Customer[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly search = toSignal(this.searchControl.valueChanges.pipe(startWith('')), {
    initialValue: '',
  });
  private readonly immediateSearch = new Subject<string>();

  constructor() {
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
        startWith({ immediate: true, value: '' }),
        switchMap(({ value }) => {
          this.errorMessage.set(null);
          if (!this.loading()) this.searching.set(true);
          return this.customersService.getCustomersPage(value.trim(), 1, 20).pipe(
            catchError((error: unknown) => {
              this.errorMessage.set(this.errorMessageService.fromHttp(error));
              return of({ data: [], limit: 20, page: 1, total: 0, totalPages: 1 });
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.customers.set(response.data);
        this.page.set(response.page);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
        this.searching.set(false);
      });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.customersService
      .getCustomersPage(this.searchControl.value.trim(), page, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.customers.set(response.data);
        this.page.set(response.page);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
      });
  }

  searchImmediately(): void {
    this.immediateSearch.next(this.searchControl.value);
  }

  formatCpfCnpj(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (digits.length === 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    if (digits.length === 14) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

    return value;
  }
}
