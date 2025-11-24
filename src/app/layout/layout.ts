import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
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

  // Propiedades de UI
  tieneNotificaciones = true;
  mostrarDropdown = false;
  mostrarNotificaciones = false;

  // Lista de notificaciones
  notificaciones = [
    {
      id: 1,
      tipo: 'info',
      titulo: 'Nuevo presupuesto asignado',
      mensaje: 'Se ha asignado un presupuesto de $50K al Centro de Costo Administrativo',
      fecha: new Date(Date.now() - 3600000), // hace 1 hora
      leida: false
    },
    {
      id: 2,
      tipo: 'warning',
      titulo: 'Presupuesto próximo a agotarse',
      mensaje: 'El rubro "Servicios Públicos" está al 85% de ejecución',
      fecha: new Date(Date.now() - 7200000), // hace 2 horas
      leida: false
    },
    {
      id: 3,
      tipo: 'success',
      titulo: 'Reporte generado exitosamente',
      mensaje: 'El reporte mensual de gastos está listo para descargar',
      fecha: new Date(Date.now() - 86400000), // hace 1 día
      leida: true
    },
    {
      id: 4,
      tipo: 'error',
      titulo: 'Error en asignación',
      mensaje: 'No se pudo procesar la asignación al proyecto XYZ-2024',
      fecha: new Date(Date.now() - 172800000), // hace 2 días
      leida: true
    },
    {
      id: 5,
      tipo: 'info',
      titulo: 'Actualización del sistema',
      mensaje: 'Nueva versión disponible con mejoras de rendimiento',
      fecha: new Date(Date.now() - 259200000), // hace 3 días
      leida: true
    }
  ];

  constructor(private router: Router) {}

  // Toggle del dropdown de usuario
  toggleDropdown(): void {
    this.mostrarDropdown = !this.mostrarDropdown;
    if (this.mostrarDropdown) {
      this.mostrarNotificaciones = false; // Cierra notificaciones si está abierto
    }
  }

  // Toggle del panel de notificaciones
  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.mostrarDropdown = false; // Cierra dropdown si está abierto
    }
  }

  // Marcar una notificación como leída
  marcarComoLeida(id: number): void {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion) {
      notificacion.leida = true;
    }
    this.actualizarEstadoNotificaciones();
  }

  // Marcar todas las notificaciones como leídas
  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.actualizarEstadoNotificaciones();
  }

  // Eliminar una notificación
  eliminarNotificacion(id: number): void {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.actualizarEstadoNotificaciones();
  }

  // Actualizar el estado del badge de notificaciones
  actualizarEstadoNotificaciones(): void {
    this.tieneNotificaciones = this.notificaciones.some(n => !n.leida);
  }

  // Obtener el número de notificaciones no leídas
  get notificacionesNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  // Calcular tiempo transcurrido desde la notificación
  getTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias === 1) return 'Hace 1 día';
    return `Hace ${dias} días`;
  }

  // Obtener el path del icono según el tipo de notificación
  getIconoTipo(tipo: string): string {
    switch(tipo) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default: // info
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  // Obtener las clases de color según el tipo de notificación
  getColorTipo(tipo: string): string {
    switch(tipo) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default: // info
        return 'text-blue-600 bg-blue-50';
    }
  }
}