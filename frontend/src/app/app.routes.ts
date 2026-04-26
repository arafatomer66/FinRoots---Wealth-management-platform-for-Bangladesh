import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'assets',
    loadComponent: () => import('./features/assets/asset-list/asset-list.component').then(m => m.AssetListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'assets/new',
    loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'assets/:id/edit',
    loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'liabilities',
    loadComponent: () => import('./features/liabilities/liability-list/liability-list.component').then(m => m.LiabilityListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'family',
    loadComponent: () => import('./features/family/family-list/family-list.component').then(m => m.FamilyListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'inheritance',
    loadComponent: () => import('./features/inheritance/inheritance-planner/inheritance-planner.component').then(m => m.InheritancePlannerComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tax',
    loadComponent: () => import('./features/tax/tax-calculator/tax-calculator.component').then(m => m.TaxCalculatorComponent),
    canActivate: [authGuard],
  },
  {
    path: 'zakat',
    loadComponent: () => import('./features/zakat/zakat-calculator/zakat-calculator.component').then(m => m.ZakatCalculatorComponent),
    canActivate: [authGuard],
  },
  {
    path: 'income',
    loadComponent: () => import('./features/income/income-list/income-list.component').then(m => m.IncomeListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadComponent: () => import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goals',
    loadComponent: () => import('./features/goals/goal-list/goal-list.component').then(m => m.GoalListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'budgets',
    loadComponent: () => import('./features/budgets/budget-list/budget-list.component').then(m => m.BudgetListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/document-list/document-list.component').then(m => m.DocumentListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/dashboard' },
];
