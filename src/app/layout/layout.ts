import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  usuario = {
    nombre: 'Austin Robertson',
    rol: 'Administrador',
    iniciales: 'AU'
  };

  menuItems = [
    { 
      id: 'dashboard',
      nombre: 'Dashboard', 
      ruta: '/dashboard'
    },
    { 
      id: 'rubros-principales',
      nombre: 'Rubros Principales', 
      ruta: '/rubros-principales'
    },
    { 
      id: 'rubros-secundarios',
      nombre: 'Rubros Secundarios', 
      ruta: '/rubros-secundarios'
    },
    { 
      id: 'propiedades',
      nombre: 'Propiedades de Rubro', 
      ruta: '/propiedades'
    },
    { 
      id: 'dependencias',
      nombre: 'Centros de Costo', 
      ruta: '/dependencias'
    },
    { 
      id: 'asignaciones',
      nombre: 'Asignaciones', 
      ruta: '/asignaciones'
    },
    { 
      id: 'movimientos',
      nombre: 'Movimientos', 
      ruta: '/movimientos'
    },
    { 
      id: 'reportes',
      nombre: 'Reportes', 
      ruta: '/reportes'
    },
    { 
      id: 'usuarios',
      nombre: 'Administración', 
      ruta: '/usuarios'
    }
  ];

  tieneNotificaciones = true;
  mostrarDropdown = false;

  toggleDropdown() {
    this.mostrarDropdown = !this.mostrarDropdown;
  }
}
