import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Employee } from './components/employee/employee';
import { Department } from './components/department/department';
import { Leave } from './components/leave/leave';
import { Payroll } from './components/payroll/payroll';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'employees', component: Employee, canActivate: [authGuard] },
  { path: 'departments', component: Department, canActivate: [authGuard] },
  { path: 'leaves', component: Leave, canActivate: [authGuard] },
  { path: 'payroll', component: Payroll, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];