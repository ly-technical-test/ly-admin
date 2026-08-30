import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  SolarCard2Linear,
  SolarCheckCircleLinear,
  SolarCopyLinear,
  SolarDocumentTextLinear,
  SolarLockLinear,
  SolarQrCodeLinear,
} from '@solar-icons/angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import JsBarcode from 'jsbarcode';
import { toDataURL } from 'qrcode';
import { toast } from 'ngx-sonner';
import { ErrorMessageService } from '../../../../core/errors/error-message.service';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { LoadingScreen } from '../../../../shared/components/loading-screen/loading-screen';
import { BillingService } from '../../data-access/billing.service';
import { CheckoutCharge } from '../../models/charge.model';

type CheckoutMethod = 'boleto' | 'cartao' | 'pix';

function validateCardNumber(control: AbstractControl<string>): ValidationErrors | null {
  const length = control.value.replace(/\D/g, '').length;
  return length >= 13 && length <= 16 ? null : { invalidCardNumber: true };
}

function validateExpiry(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!/^\d{2}\/\d{2}$/.test(value)) return { invalidExpiry: true };

  const month = Number(value.slice(0, 2));
  const year = Number(value.slice(3));
  const now = new Date();
  const currentYear = now.getFullYear() % 100;

  if (month < 1 || month > 12 || year < currentYear) return { invalidExpiry: true };
  if (year === currentYear && month < now.getMonth() + 1) return { invalidExpiry: true };

  return null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormField,
    LoadingScreen,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSpinner,
    ReactiveFormsModule,
    RouterLink,
    SolarCard2Linear,
    SolarCheckCircleLinear,
    SolarCopyLinear,
    SolarDocumentTextLinear,
    SolarLockLinear,
    SolarQrCodeLinear,
  ],
  selector: 'app-external-checkout',
  styleUrls: ['./external-checkout.css', '../../../auth/pages/auth-form.css'],
  templateUrl: './external-checkout.html',
})
export class ExternalCheckout {
  private readonly billingService = inject(BillingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly route = inject(ActivatedRoute);

  readonly charge = signal<CheckoutCharge | null>(null);
  readonly copiedValue = signal<string | null>(null);
  readonly loading = signal(true);
  readonly paymentError = signal<string | null>(null);
  readonly boletoBarcode = signal<string | null>(null);
  readonly pixQrCode = signal<string | null>(null);
  readonly selectedMethod = signal<CheckoutMethod>('pix');
  readonly submitting = signal(false);
  readonly cardForm = new FormGroup({
    cardNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, validateCardNumber] }),
    cvc: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    expiry: new FormControl('', { nonNullable: true, validators: [Validators.required, validateExpiry] }),
    holder: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(128)],
    }),
  });
  readonly availableMethods = computed(() => {
    const method = this.charge()?.paymentMethod;
    if (method === 'all') return ['pix', 'cartao', 'boleto'] as CheckoutMethod[];
    if (method === 'creditCard') return ['cartao'] as CheckoutMethod[];
    return method ? [method as CheckoutMethod] : [];
  });
  readonly isPaid = computed(() => this.charge()?.status === 'PAID');
  readonly allowsMultipleMethods = computed(() => this.charge()?.paymentMethod === 'all');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCharge(id);
  }

  get expiryError(): string | undefined {
    const control = this.cardForm.controls.expiry;
    return control.invalid && control.touched ? 'Validade inválida.' : undefined;
  }

  copy(value: string): void {
    void navigator.clipboard.writeText(value).then(() => {
      this.copiedValue.set(value);
      toast.success('Copiado para a área de transferência.');
      window.setTimeout(() => this.copiedValue.set(null), 1000);
    });
  }

  onCardNumberInput(value: string): void {
    const cardNumber = value.replace(/\D/g, '').slice(0, 16);
    this.cardForm.controls.cardNumber.setValue(cardNumber.replace(/(\d{4})(?=\d)/g, '$1 '), {
      emitEvent: false,
    });
  }

  onCvcInput(value: string): void {
    this.cardForm.controls.cvc.setValue(value.replace(/\D/g, '').slice(0, 4), { emitEvent: false });
  }

  onExpiryInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    this.cardForm.controls.expiry.setValue(
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
      { emitEvent: false },
    );
  }

  onHolderInput(value: string): void {
    this.cardForm.controls.holder.setValue(value.toUpperCase().replace(/\s+/g, ' '), { emitEvent: false });
  }

  payByCard(): void {
    const charge = this.charge();
    if (!charge || this.cardForm.invalid || this.submitting()) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const value = this.cardForm.getRawValue();
    this.paymentError.set(null);
    this.submitting.set(true);
    this.billingService
      .payByCard({
        cardNumber: value.cardNumber.replace(/\D/g, ''),
        chargeId: charge._id,
        cvc: value.cvc,
        expiry: value.expiry.replace(/\D/g, ''),
        holder: value.holder.trim(),
        method: 'creditCard',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.paymentError.set(this.errorMessageService.fromHttp(error));
          this.submitting.set(false);
        },
        next: () => this.loadCharge(charge._id),
      });
  }

  selectMethod(method: CheckoutMethod): void {
    this.selectedMethod.set(method);
    this.paymentError.set(null);
  }

  simulatePayment(): void {
    const charge = this.charge();
    if (!charge || this.submitting() || this.isPaid()) return;

    const selectedMethod = this.selectedMethod();
    const paymentMethod = selectedMethod === 'cartao' ? 'creditCard' : selectedMethod;
    this.submitting.set(true);
    this.paymentError.set(null);
    this.billingService
      .simulatePayment(charge._id, paymentMethod)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.paymentError.set(this.errorMessageService.fromHttp(error));
          this.submitting.set(false);
        },
        next: () => this.loadCharge(charge._id),
      });
  }

  private loadCharge(id: string): void {
    this.loading.set(true);
    this.billingService
      .getCheckoutCharge(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: unknown) => {
          this.paymentError.set(this.errorMessageService.fromHttp(error));
          this.loading.set(false);
        },
        next: (charge) => {
          this.charge.set(charge);
          this.selectedMethod.set(this.availableMethods()[0]);
          this.setBoletoBarcode(charge.boleto?.barcode);
          this.setPixQrCode(charge.pix?.qrcode);
          this.loading.set(false);
          this.submitting.set(false);
        },
      });
  }

  private setPixQrCode(value: string | undefined): void {
    if (!value) {
      this.pixQrCode.set(null);
      return;
    }

    void toDataURL(value, { margin: 1, width: 256 })
      .then((dataUrl) => this.pixQrCode.set(dataUrl))
      .catch(() => this.pixQrCode.set(null));
  }

  private setBoletoBarcode(value: string | undefined): void {
    if (!value) {
      this.boletoBarcode.set(null);
      return;
    }

    const barcode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(barcode, value, { displayValue: false, height: 56, margin: 0, width: 1.4 });
    const markup = new XMLSerializer().serializeToString(barcode);
    this.boletoBarcode.set(`data:image/svg+xml;base64,${btoa(markup)}`);
  }
}
