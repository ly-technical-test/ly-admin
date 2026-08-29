import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
  {
    data: { pageTitle: 'Nova cobrança' },
    loadComponent: () =>
      import('./pages/issue-charge/issue-charge').then(({ IssueCharge }) => IssueCharge),
    path: 'issue',
    title: 'Nova cobrança',
  },
  {
    data: { pageTitle: 'Cobranças' },
    loadComponent: () =>
      import('./pages/charge-list/charge-list').then(({ ChargeList }) => ChargeList),
    path: 'list',
    title: 'Cobranças',
  },
];
