import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarCredenciales } from './pages/recuperar-credenciales/recuperar-credenciales';
import { Layout } from './layout/layout';
import { Inicio } from './pages/inicio/inicio';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'recuperar-acceso', component: RecuperarCredenciales },
  
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inicio',
        component: Inicio,
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'gestor-de-informacion',
        loadComponent: () => import('./pages/gestor-de-informacion/gestor-de-informacion').then(m => m.GestorDeInformacion)
      },
      {
        path: 'rubros-principales',
        loadComponent: () => import('./pages/rubros-principales/rubros-principales').then(m => m.RubrosPrincipales),
        canActivate: [AuthGuard] 
      },
      {
        path: 'rubros-secundarios',
        loadComponent: () => import('./pages/rubros-secundarios/rubros-secundarios').then(m => m.RubrosSecundarios)
      },
      {
        path: 'rubros-terciarios',
        loadComponent: () => import('./pages/rubros-terciaro/rubros-terciaro').then(m => m.RubrosTerciarios)
      },
      /* {
        path: 'rubros-cuaternarios',
        loadComponent: () => import('./pages/rubros-cuaternarios/rubros-cuaternarios').then(m => m.RubrosCuaternariosComponent)
      },
      {
        path: 'rubros-quinarios',
        loadComponent: () => import('./pages/rubros-quinarios/rubros-quinarios').then(m => m.RubrosQuinariosComponent)
      },
      {
        path: 'rubros-senarios',
        loadComponent: () => import('./pages/rubros-senarios/rubros-senarios').then(m => m.RubrosSenarioComponent)
      }, */
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
        loadComponent: () => import('./pages/administracion/administracion').then(m => m.AdministracionComponent)
      },
      {
        path: '**',
        loadComponent: () => import('./pages/pagina-generica/pagina-generica').then(m => m.PaginaGenerica)
      }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
]
