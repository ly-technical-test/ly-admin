import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
  {
    data: {
      description: 'Emita uma nova cobrança para um cliente cadastrado.',
      pageTitle: 'Nova cobrança',
    },
    loadComponent: () =>
      import('./pages/issue-charge/issue-charge').then(({ IssueCharge }) => IssueCharge),
    path: 'issue',
    title: 'Nova cobrança | Desafio Lytex',
  },
  {
    data: {
      description: 'Consulte e acompanhe as cobranças emitidas pela sua conta.',
      pageTitle: 'Cobranças',
    },
    loadComponent: () =>
      import('./pages/charge-list/charge-list').then(({ ChargeList }) => ChargeList),
    path: 'list',
    title: 'Cobranças | Desafio Lytex',
  },
];
