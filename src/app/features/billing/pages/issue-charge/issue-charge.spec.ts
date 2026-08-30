import { vi } from 'vitest';
vi.mock('@solar-icons/angular', () => ({
  SolarEyeClosedLinear: '', SolarEyeLinear: '', SolarMagnifierLinear: '', SolarCopyLinear: '',
  SolarCard2Linear: '', SolarAltArrowLeftLinear: '', SolarAltArrowRightLinear: '', SolarLetterLinear: '',
  SolarArrowRightLinear: '', SolarLockPasswordLinear: '', SolarUserLinear: '', SolarAddCircleLinear: '',
  SolarLogoutLinear: '', SolarWalletLinear: '', SolarCheckCircleLinear: '', SolarDangerCircleLinear: '',
  SolarLockLinear: '', SolarDocumentTextLinear: '', SolarBuildingsLinear: '', SolarHomeLinear: '', SolarMapLinear: '', SolarMapPointLinear: '', SolarQrCodeLinear: ''
}));
import { render } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { IssueCharge } from './issue-charge';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('IssueCharge', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('renders successfully', async () => {
    const { fixture } = await render(IssueCharge, {
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});
