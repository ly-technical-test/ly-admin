import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/sign-in/sign-in').then(({ SignIn }) => SignIn),
    path: 'login',
  },
  {
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/sign-up/sign-up').then(({ SignUp }) => SignUp),
    path: 'register',
  },
  { path: 'sign-in', pathMatch: 'full', redirectTo: 'login' },
  { path: 'sign-up', pathMatch: 'full', redirectTo: 'register' },
  {
    canActivate: [authGuard],
    children: [
      {
        data: { pageTitle: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            ({ Dashboard }) => Dashboard,
          ),
        path: 'dashboard',
        title: 'Dashboard',
      },
      {
        loadChildren: () =>
          import('./features/billing/billing.routes').then(({ billingRoutes }) => billingRoutes),
        path: 'billing',
      },
      {
        data: { pageTitle: 'Clientes' },
        loadComponent: () =>
          import('./features/customers/pages/customer-list/customer-list').then(
            ({ CustomerList }) => CustomerList,
          ),
        path: 'customers',
        title: 'Clientes',
      },
    ],
    loadComponent: () =>
      import('./core/layout/admin-layout/admin-layout').then(({ AdminLayout }) => AdminLayout),
    path: '',
  },
  { path: '**', redirectTo: '' },
];
