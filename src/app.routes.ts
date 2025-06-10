import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { Login } from './app/pages/auth/login';
import { AuthGuard } from './app/pages/service/auth.guard';
import { NoAuthGuard } from './app/pages/service/no-auth.guard';
import { TransactionsCRUD } from './app/pages/transactions/transactionsCRUD';
import { CategoriesCRUD } from './app/pages/categories/categoriesCRUD';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Dashboard, canActivate: [AuthGuard] },
      { path: 'transacciones', component: TransactionsCRUD, canActivate: [NoAuthGuard] },
      { path: 'categorias', component: CategoriesCRUD, canActivate: [NoAuthGuard] },
      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      // { path: 'documentation', component: Documentation },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },
  // { path: 'transacciones', component: TransactionsCRUD, canActivate: [NoAuthGuard] }
  { path: 'login', component: Login, canActivate: [NoAuthGuard] },
  // { path: 'transacciones', component: TransactionsCRUD, canActivate: [NoAuthGuard] },
  // { path: 'landing', component: Landing },
  // { path: 'notfound', component: Notfound },
  // // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
  // { path: '**', redirectTo: '/notfound' }
];
