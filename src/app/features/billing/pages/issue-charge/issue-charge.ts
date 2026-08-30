import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  SolarBuildingsLinear,
  SolarCard2Linear,
  SolarDocumentTextLinear,
  SolarHomeLinear,
  SolarLetterLinear,
  SolarMagnifierLinear,
  SolarMapLinear,
  SolarMapPointLinear,
  SolarQrCodeLinear,
  SolarUserLinear,
  SolarWalletLinear,
} from '@solar-icons/angular';
import { HlmAlert, HlmAlertDescription } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap } from 'rxjs';
import { ErrorMessageService } from '../../../../core/errors/error-message.service';
import { CheckoutPreferencesService } from '../../../../core/preferences/checkout-preferences.service';
import { PaginatedData } from '../../../../core/http/api-response.model';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { AddressService } from '../../../customers/data-access/address.service';
import { CustomersService } from '../../../customers/data-access/customers.service';
import { CreateCustomerPayload, Customer } from '../../../customers/models/customer.model';
import { BillingService } from '../../data-access/billing.service';
import { CustomerPickerTable } from '../../components/customer-picker-table/customer-picker-table';
import { IssueChargePayload } from '../../models/charge.model';

type CustomerMode = 'existing' | 'new';
type PaymentMethod = IssueChargePayload['payment_method'];

function validateDocument(control: AbstractControl<string>): ValidationErrors | null {
  const digits = control.value.replace(/\D/g, '');
  if (digits.length !== 11 && digits.length !== 14) return { invalidDocument: true };
  if (/^(\d)\1+$/.test(digits)) return { invalidDocument: true };
  if (digits.length === 14) return null;
  const verifier = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return verifier(9) === Number(digits[9]) && verifier(10) === Number(digits[10])
    ? null
    : { invalidDocument: true };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CustomerPickerTable,
    FormField,
    HlmAlert,
    HlmAlertDescription,
    HlmButton,
    HlmCardImports,
    HlmInput,
    ReactiveFormsModule,
    SolarBuildingsLinear,
    SolarCard2Linear,
    SolarDocumentTextLinear,
    SolarHomeLinear,
    SolarLetterLinear,
    SolarMagnifierLinear,
    SolarMapLinear,
    SolarMapPointLinear,
    SolarQrCodeLinear,
    SolarUserLinear,
    SolarWalletLinear,
  ],
  selector: 'app-issue-charge',
  styleUrl: './issue-charge.css',
  templateUrl: './issue-charge.html',
})
export class IssueCharge {
  private readonly billingService = inject(BillingService);
  private readonly addressService = inject(AddressService);
  private readonly customersService = inject(CustomersService);
  private readonly checkoutPreferencesService = inject(CheckoutPreferencesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly router = inject(Router);

  readonly customers = signal<Customer[]>([]);
  readonly customersLoading = signal(false);
  readonly customerPage = signal(1);
  readonly customerTotal = signal(0);
  readonly customerTotalPages = signal(1);
  readonly customerMode = signal<CustomerMode>('existing');
  readonly customerSaving = signal(false);
  readonly issueSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly customerSearchControl = new FormControl('', { nonNullable: true });
  readonly paymentMethod = signal<PaymentMethod>('pix');
  readonly chargeForm = new FormGroup({
    amount: new FormControl('R$ 0,00', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300)],
    }),
  });
  readonly customerForm = new FormGroup({
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    complement: new FormControl('', { nonNullable: true }),
    cpfCnpj: new FormControl('', { nonNullable: true, validators: [Validators.required, validateDocument] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(128)],
    }),
    number: new FormControl('', { nonNullable: true }),
    state: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)] }),
    street: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    zip: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)] }),
    zone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly amount = toSignal(this.chargeForm.controls.amount.valueChanges.pipe(startWith('')), {
    initialValue: '',
  });
  readonly amountInCents = computed(() => this.toCents(this.amount()));
  readonly description = toSignal(
    this.chargeForm.controls.description.valueChanges.pipe(startWith('')),
    {
      initialValue: '',
    },
  );
  readonly issueDisabledReason = computed(() => {
    if (!this.selectedCustomer()) return 'Selecione um cliente para continuar.';
    if (this.amountInCents() < 200) return 'O valor mínimo da cobrança é R$ 2,00.';
    if (this.amountInCents() > 5000000) return 'O valor máximo da cobrança é R$ 50.000,00.';
    if (this.description().trim().length < 5) return 'A descrição deve ter ao menos 5 caracteres.';
    return null;
  });
  readonly canIssue = computed(
    () =>
      this.selectedCustomer() !== null &&
      this.description().trim().length >= 5 &&
      this.description().length <= 300 &&
      this.amountInCents() >= 200 &&
      this.amountInCents() <= 5000000,
  );

  constructor() {
    this.customerSearchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        switchMap((search) => this.getCustomerPage(search.trim(), 1)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (response) this.setCustomerPage(response);
        this.customersLoading.set(false);
      });
  }

  issueCharge(): void {
    if (!this.canIssue() || this.issueSaving()) {
      this.chargeForm.markAllAsTouched();
      return;
    }

    const customer = this.selectedCustomer();
    if (!customer) return;

    const payload: IssueChargePayload = {
      amount: this.amountInCents(),
      customerId: customer._id,
      description: this.chargeForm.controls.description.value.trim(),
      payment_method: this.paymentMethod(),
    };

    this.errorMessage.set(null);
    this.issueSaving.set(true);

    this.billingService
      .issueCharge(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.errorMessage.set(this.errorMessageService.fromHttp(error));
          this.issueSaving.set(false);
        },
        next: (charge) => {
          this.issueSaving.set(false);
          window.open(this.checkoutPreferencesService.getCheckoutLink(charge), '_blank', 'noopener');
          void this.router.navigateByUrl('/billing/list');
        },
      });
  }

  saveCustomer(): void {
    if (this.customerForm.invalid || this.customerSaving()) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const value = this.customerForm.getRawValue();
    const payload: CreateCustomerPayload = {
      address: {
        city: value.city.trim(),
        complement: value.complement.trim() || undefined,
        number: value.number.trim() || undefined,
        state: value.state.trim(),
        street: value.street.trim(),
        zip: this.onlyDigits(value.zip),
        zone: value.zone.trim(),
      },
      cpfCnpj: this.onlyDigits(value.cpfCnpj),
      email: value.email.trim(),
      name: value.name.trim(),
    };

    this.errorMessage.set(null);
    this.customerSaving.set(true);

    this.customersService
      .createCustomer(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.errorMessage.set(this.errorMessageService.fromHttp(error));
          this.customerSaving.set(false);
        },
        next: (customer) => {
          this.customers.update((customers) => [customer, ...customers]);
          this.selectedCustomer.set(customer);
          this.customerForm.reset();
          this.customerMode.set('existing');
          this.customerSaving.set(false);
        },
      });
  }

  selectCustomer(customer: Customer | null | undefined): void {
    this.selectedCustomer.set(customer ?? null);
  }

  changeCustomerPage(page: number): void {
    if (page < 1) return;
    this.getCustomerPage(this.customerSearchControl.value.trim(), page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response) this.setCustomerPage(response);
        this.customersLoading.set(false);
      });
  }

  onAmountInput(value: string): void {
    const cents = this.onlyDigits(value).slice(-9);
    const amount = Number(cents || '0');
    this.chargeForm.controls.amount.setValue(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / 100),
      { emitEvent: true },
    );
  }

  setCustomerMode(mode: CustomerMode): void {
    this.customerMode.set(mode);
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  generateCpf(): void {
    const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    const firstDigit = this.cpfVerifier(digits, 10);
    const secondDigit = this.cpfVerifier([...digits, firstDigit], 11);
    this.customerForm.controls.cpfCnpj.setValue(
      this.formatCpfCnpj([...digits, firstDigit, secondDigit].join('')),
    );
  }

  onCpfCnpjInput(value: string): void {
    this.customerForm.controls.cpfCnpj.setValue(this.formatCpfCnpj(value), { emitEvent: false });
  }

  onZipInput(value: string): void {
    const zip = this.onlyDigits(value).slice(0, 8);
    this.customerForm.controls.zip.setValue(this.formatZip(zip), { emitEvent: false });

    if (zip.length === 8) this.lookupZip(zip);
  }

  private toCents(value: string): number {
    return Number(this.onlyDigits(value)) || 0;
  }

  private cpfVerifier(digits: number[], factor: number): number {
    const sum = digits.reduce((total, digit, index) => total + digit * (factor - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }

  private formatCpfCnpj(value: string): string {
    const digits = this.onlyDigits(value).slice(0, 14);
    if (digits.length <= 11)
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  private formatZip(value: string): string {
    return value.replace(/(\d{5})(\d)/, '$1-$2');
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  private lookupZip(zip: string): void {
    this.addressService
      .getByZip(zip)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => this.errorMessage.set(this.errorMessageService.fromHttp(error)),
        next: (address) => {
          if (!address) return;
          this.customerForm.patchValue(address);
        },
      });
  }

  private getCustomerPage(search: string, page: number) {
    this.customersLoading.set(true);
    this.customerPage.set(page);
    return this.customersService
      .getCustomersPage(search, page, 5)
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(this.errorMessageService.fromHttp(error));
          return of(null);
        }),
      );
  }

  private setCustomerPage(response: PaginatedData<Customer>): void {
    this.customers.set(response.data);
    this.customerPage.set(response.page);
    this.customerTotal.set(response.total);
    this.customerTotalPages.set(response.totalPages);
  }
}
