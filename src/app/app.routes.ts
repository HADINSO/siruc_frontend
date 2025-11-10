import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarCredenciales } from './pages/recuperar-credenciales/recuperar-credenciales';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'recuperar-acceso', component: RecuperarCredenciales }
];