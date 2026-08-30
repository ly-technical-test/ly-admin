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
    data: { description: 'Acesse sua conta para gerenciar cobranças e pagamentos.' },
    title: 'Entrar | Desafio Lytex',
  },
  {
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/sign-up/sign-up').then(({ SignUp }) => SignUp),
    path: 'register',
    data: { description: 'Crie sua conta para começar a emitir cobranças.' },
    title: 'Criar conta | Desafio Lytex',
  },
  { path: 'sign-in', pathMatch: 'full', redirectTo: 'login' },
  { path: 'sign-up', pathMatch: 'full', redirectTo: 'register' },
  {
    loadComponent: () =>
      import('./features/billing/pages/external-checkout/external-checkout').then(
        ({ ExternalCheckout }) => ExternalCheckout,
      ),
    path: 'external/checkout/:id',
    data: { description: 'Realize o pagamento da sua cobrança de forma segura.' },
    title: 'Pagamento | Desafio Lytex',
  },
  {
    canActivate: [authGuard],
    children: [
      {
        data: {
          description: 'Acompanhe indicadores e cobranças recentes da sua conta.',
          pageTitle: 'Dashboard',
        },
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            ({ Dashboard }) => Dashboard,
          ),
        path: 'dashboard',
        title: 'Dashboard | Desafio Lytex',
      },
      {
        loadChildren: () =>
          import('./features/billing/billing.routes').then(({ billingRoutes }) => billingRoutes),
        path: 'billing',
      },
      {
        data: {
          description: 'Gerencie os clientes cadastrados para suas cobranças.',
          pageTitle: 'Clientes',
        },
        loadComponent: () =>
          import('./features/customers/pages/customer-list/customer-list').then(
            ({ CustomerList }) => CustomerList,
          ),
        path: 'customers',
        title: 'Clientes | Desafio Lytex',
      },
    ],
    loadComponent: () =>
      import('./core/layout/admin-layout/admin-layout').then(({ AdminLayout }) => AdminLayout),
    path: '',
  },
  { path: '**', redirectTo: '' },
];
