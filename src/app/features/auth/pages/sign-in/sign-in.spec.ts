import { vi } from 'vitest';
vi.mock('@solar-icons/angular', () => ({
  SolarEyeClosedLinear: '', SolarEyeLinear: '', SolarMagnifierLinear: '', SolarCopyLinear: '',
  SolarCard2Linear: '', SolarAltArrowLeftLinear: '', SolarAltArrowRightLinear: '', SolarLetterLinear: '',
  SolarArrowRightLinear: '', SolarLockPasswordLinear: '', SolarUserLinear: '', SolarAddCircleLinear: '',
  SolarLogoutLinear: '', SolarWalletLinear: '', SolarCheckCircleLinear: '', SolarDangerCircleLinear: '',
  SolarLockLinear: '', SolarDocumentTextLinear: '', SolarBuildingsLinear: ''
}));

import { render } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SignIn } from './sign-in';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('SignIn', () => {
  it('renders successfully', async () => {
    const { fixture } = await render(SignIn, {
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});
