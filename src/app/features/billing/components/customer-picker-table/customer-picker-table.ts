import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SolarAltArrowLeftLinear, SolarAltArrowRightLinear } from '@solar-icons/angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { Customer } from '../../../customers/models/customer.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HlmButton,
    HlmCheckbox,
    HlmSpinner,
    HlmTableImports,
    SolarAltArrowLeftLinear,
    SolarAltArrowRightLinear,
  ],
  selector: 'app-customer-picker-table',
  styleUrl: './customer-picker-table.css',
  templateUrl: './customer-picker-table.html',
})
export class CustomerPickerTable {
  readonly customers = input.required<Customer[]>();
  readonly loading = input.required<boolean>();
  readonly page = input.required<number>();
  readonly total = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly selectedCustomerId = input<string>();
  readonly pageChange = output<number>();
  readonly selectCustomer = output<Customer>();

  previousPage(): void {
    this.pageChange.emit(this.page() - 1);
  }

  nextPage(): void {
    this.pageChange.emit(this.page() + 1);
  }

  selectRow(customer: Customer): void {
    if (this.selectedCustomerId() !== customer._id) this.selectCustomer.emit(customer);
  }

  updateSelection(customer: Customer, checked: boolean): void {
    if (checked) this.selectRow(customer);
  }
}
