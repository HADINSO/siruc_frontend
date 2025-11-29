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
        path: 'rubros-terciarios',
        loadComponent: () => import('./pages/rubros-terciaro/rubros-terciaro').then(m => m.RubrosTerciarios)
      },
      {
        path: 'propiedades',
        loadComponent: () => import('./pages/propiedades/propiedades').then(m => m.Propiedades)
      },
      {
        path: 'centro-de-costo',
        loadComponent: () => import('./pages/centro-de-costo/centro-de-costo').then(m => m.CentrosCost)
      },
      {
        path: 'asignaciones',
        loadComponent: () => import('./pages/asignaciones/asignaciones').then(m => m.Asignaciones)
      },
      {
        path: 'administracion',
        loadComponent: () => import('./pages/administracion/administracion').then(m => m.Administracion)
      },
      {
        path: '**',
        loadComponent: () => import('./pages/pagina-generica/pagina-generica').then(m => m.PaginaGenerica)
      }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];
