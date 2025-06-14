import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Dashboard } from './dashboard/dashboard';
import { AuthGuard } from './service/auth.guard';
import { Login } from './auth/login';
import { TransactionsCRUD } from './transactions/transactionsCRUD';
import { CategoriesCRUD } from './categories/categoriesCRUD';
import { AccountsCRUD } from './accounts/accountsCRUD';
import { Register } from './auth/register';

export default [
  { path: '', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'transacciones', component: TransactionsCRUD, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoriesCRUD, canActivate: [AuthGuard] },
  { path: 'cuentas', component: AccountsCRUD, canActivate: [AuthGuard] },
  // { path: 'documentation', component: Documentation },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // { path: 'crud', component: Crud },
  // { path: 'empty', component: Empty },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
