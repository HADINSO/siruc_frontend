import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarCredenciales } from './pages/recuperar-credenciales/recuperar-credenciales';
import { Layout } from './layout/layout';
import { Inicio } from './pages/inicio/inicio';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'recuperar-acceso', component: RecuperarCredenciales },
  
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'inicio',
        component: Inicio
      },
      {
        path: 'dashboard',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'rubros-principales',
        loadComponent: () => import('./pages/rubros-principales/rubros-principales').then(m => m.RubrosPrincipales)
      },
      {
        path: 'rubros-secundarios',
        loadComponent: () => import('./pages/rubros-secundarios/rubros-secundarios').then(m => m.RubrosSecundarios)
      },
      {
        path: 'propiedades',
        loadComponent: () => import('./pages/propiedades/propiedades').then(m => m.Propiedades)
      },
      {
        path: 'centros-cost',
        loadComponent: () => import('./pages/centros-cost/centros-cost').then(m => m.CentrosCost)
      },
      {
        path: 'asignaciones',
        loadComponent: () => import('./pages/asignaciones/asignaciones').then(m => m.Asignaciones)
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./pages/movimientos/movimientos').then(m => m.Movimientos)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./pages/reportes/reportes').then(m => m.Reportes)
      },
      {
        path: 'administracion',
        loadComponent: () => import('./pages/administracion/administracion').then(m => m.Administracion)
      }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];