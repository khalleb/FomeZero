import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'snacks',
        loadComponent: () => import('./components/snacks/snacks.component').then(m => m.SnacksComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./components/sales/sales.component').then(m => m.SalesComponent)
      },
      {
        path: 'accounts-receivable',
        loadComponent: () => import('./components/accounts-receivable/accounts-receivable.component').then(m => m.AccountsReceivableComponent)
      },
      {
        path: 'payment-methods',
        loadComponent: () => import('./components/payment-methods/payment-methods.component').then(m => m.PaymentMethodsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
