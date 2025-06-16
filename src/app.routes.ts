import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/pages/service/auth.guard';
import { NoAuthGuard } from './app/pages/service/no-auth.guard';
import { Login } from './app/pages/auth/login';
import { Register } from './app/pages/auth/register';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Dashboard, canActivate: [AuthGuard] },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },
  { path: 'login', component: Login, canActivate: [NoAuthGuard] },
  { path: 'register', component: Register },
  { path: 'notfound', component: Notfound },
  { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
