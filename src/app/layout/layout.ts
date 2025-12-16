import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutService, MenuItem } from '../services/layout.service';
import { Auth } from '../services/auth';
import { HistorialService } from '../services/historial.service';
import { ModalPerfil } from './modal-perfil/modal-perfil';  
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { CerrarSesionComponent } from './cerrarSesion/cerrarSesion';


interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  fecha: Date;
  leida: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    CommonModule,
    FormsModule,
    ModalPerfil,
    ConfiguracionComponent,
    CerrarSesionComponent,  // ← NUEVO
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  usuario = {
    nombre: 'Usuario',
    rol: 'Cargando...',
    iniciales: 'U',
    email: 'usuario@utch.edu.co',
    telefono: '+57 300 000 0000'
  };

  menuItems: MenuItem[] = [];
  tieneNotificaciones = true;
  mostrarDropdown = false;
  mostrarNotificaciones = false;
  mostrarModalPerfil = false;
  mostrarConfiguracion = false; 
  mostrarModalCerrarSesion = false; // ← NUEVO
  cargandoMenu = true;

  notificaciones: Notificacion[] = [
    {
      id: 1,
      titulo: 'Nueva asignación aprobada',
      mensaje: 'La asignación presupuestal para Facultad de Ingeniería ha sido aprobada.',
      tipo: 'success',
      fecha: new Date(Date.now() - 1000 * 60 * 30),
      leida: false
    },
    {
      id: 2,
      titulo: 'Presupuesto bajo',
      mensaje: 'El centro de costo "Administración" tiene menos del 20% de presupuesto disponible.',
      tipo: 'warning',
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 2),
      leida: false
    }
  ];

  notificacionesNoLeidas: number = 0;

  coloresIconos: { [key: string]: string } = {
    'home': 'text-blue-500',
    'folder': 'text-amber-500',
    'folder-tree': 'text-amber-500',
    'layers': 'text-purple-500',
    'settings': 'text-slate-600',
    'building': 'text-cyan-500',
    'arrow-left-right': 'text-indigo-500',
    'users': 'text-orange-500',
    'trending-up': 'text-green-500',
    'file-text': 'text-pink-500',
    'dollar-sign': 'text-emerald-500',
    'calculator': 'text-blue-600',
    'file-invoice': 'text-red-500',
    'credit-card': 'text-purple-600',
    'package': 'text-yellow-600',
    'box': 'text-orange-600',
    'user': 'text-indigo-600',
    'truck': 'text-green-600',
    'briefcase': 'text-slate-500',
    'check-square': 'text-teal-500',
    'calendar': 'text-rose-500',
    'shield': 'text-blue-700',
    'help-circle': 'text-purple-700',
    'life-buoy': 'text-cyan-600',
    'bell': 'text-yellow-500',
    'mail': 'text-blue-400',
    'file': 'text-gray-500',
    'bar-chart': 'text-green-700',
    'pie-chart': 'text-pink-600',
    'activity': 'text-red-600'
  };

  iconosSVG: { [key: string]: string } = {
    'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    'folder-tree': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    'layers': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'building': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    'arrow-left-right': 'M7 16l-4-4m0 0l4-4m-4 4h18m-4 8l4-4m0 0l-4-4',
    'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'dollar-sign': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'calculator': 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    'file-invoice': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    'package': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    'box': 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'truck': 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h3.5',
    'briefcase': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    'check-square': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'help-circle': 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'life-buoy': 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    'bell': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    'mail': 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    'file': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    'bar-chart': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    'pie-chart': 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
    'activity': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  };

  constructor(
    private layoutService: LayoutService,
    private authService: Auth,
    private router: Router,
    private historialService: HistorialService
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarDatosUsuario();
    this.cargarMenuDesdeAPI();
    this.calcularNotificacionesNoLeidas();
  }

  verificarAutenticacion(): void {
    if (!this.authService.isAuthenticated()) {
      console.log('⛔ No autenticado, redirigiendo al login');
      this.router.navigate(['/login']);
    }
  }

  cargarDatosUsuario(): void {
    const nombre = this.authService.getNombreUsuario();
    const rol = this.authService.getRolUsuario();
    const email = this.authService.getCorreoUsuario();
    
    this.usuario = {
      nombre: nombre,
      rol: rol,
      iniciales: this.obtenerIniciales(nombre),
      email: email || 'usuario@utch.edu.co',
      telefono: '+57 300 000 0000'
    };

    console.log('👤 Datos del usuario cargados:', this.usuario);
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    
    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  cargarMenuDesdeAPI(): void {
    const personaId = this.authService.getPersonaId();
    
    if (!personaId) {
      console.error('❌ No hay persona_id en localStorage');
      this.menuItems = [];
      this.cargandoMenu = false;
      return;
    }

    console.log('📋 Cargando menu para persona_id:', personaId);

    this.layoutService.getMenuItems(personaId).subscribe({
      next: (items) => {
        console.log('✅ Items recibidos del servicio:', items);
        
        if (items && items.length > 0) {
          const dashboard: MenuItem = { 
            id: 'dashboard',
            nombre: 'Dashboard', 
            ruta: '/inicio',
            icono: 'home',
            orden: 0
          };
          this.menuItems = [dashboard, ...items];
          console.log('📋 Menu final construido:', this.menuItems);
        } else {
          console.warn('⚠️ No se recibieron elementos del menu');
          this.menuItems = [];
        }
        this.cargandoMenu = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar el menu en el componente:', error);
        this.menuItems = [];
        this.cargandoMenu = false;
      }
    });
  }

  getIconoSVG(icono: string): string {
    return this.iconosSVG[icono] || this.iconosSVG['layers'];
  }

  getColorIcono(icono: string): string {
    return this.coloresIconos[icono] || 'text-gray-500';
  }

  abrirModalPerfil(): void {
    this.mostrarModalPerfil = true;
    this.mostrarDropdown = false;
  }

  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
  }

  guardarPerfil(datosActualizados: any): void {
    this.usuario.nombre = datosActualizados.nombre;
    this.usuario.email = datosActualizados.email;
    this.usuario.telefono = datosActualizados.telefono;
    this.usuario.iniciales = this.obtenerIniciales(datosActualizados.nombre);
    console.log('✅ Perfil actualizado:', this.usuario);
  }

  abrirConfiguracion(): void {
    this.mostrarConfiguracion = true;
    this.mostrarDropdown = false;
  }

  cerrarConfiguracion(): void {
    this.mostrarConfiguracion = false;
  }

  guardarConfiguracion(configActualizada: any): void {
    console.log('✅ Configuracion actualizada:', configActualizada);
  }

  toggleDropdown(): void {
    this.mostrarDropdown = !this.mostrarDropdown;
    if (this.mostrarDropdown) {
      this.mostrarNotificaciones = false;
    }
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.mostrarDropdown = false;
    }
  }

  calcularNotificacionesNoLeidas(): void {
    this.notificacionesNoLeidas = this.notificaciones.filter(n => !n.leida).length;
  }

  marcarComoLeida(id: number): void {
    const notif = this.notificaciones.find(n => n.id === id);
    if (notif && !notif.leida) {
      notif.leida = true;
      this.calcularNotificacionesNoLeidas();
    }
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.calcularNotificacionesNoLeidas();
  }

  eliminarNotificacion(id: number): void {
    const index = this.notificaciones.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notificaciones.splice(index, 1);
      this.calcularNotificacionesNoLeidas();
    }
  }

  getColorTipo(tipo: string): string {
    const colores: { [key: string]: string } = {
      'info': 'bg-blue-100 text-blue-600',
      'success': 'bg-green-100 text-green-600',
      'warning': 'bg-orange-100 text-orange-600',
      'error': 'bg-red-100 text-red-600'
    };
    return colores[tipo] || colores['info'];
  }

  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'info': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'success': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'error': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return iconos[tipo] || iconos['info'];
  }

  getTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Hace ${dias} dia${dias > 1 ? 's' : ''}`;
  }

  /**
   * ✅ Metodo para abrir el modal de cerrar sesion
   */
  cerrarSesion(): void {
    console.log('🚪 Mostrando modal de cierre de sesion...');
    this.mostrarModalCerrarSesion = true;
    this.mostrarDropdown = false;
  }

  /**
   * ✅ Metodo para confirmar el cierre de sesion
   */
  confirmarCierreSesion(): void {
    console.log('✅ Confirmando cierre de sesion...');
    this.mostrarModalCerrarSesion = false;
    this.historialService.limpiarHistorial();
    this.authService.logout();
  }

  /**
   * ✅ Metodo para cancelar el cierre de sesion
   */
  cancelarCierreSesion(): void {
    console.log('❌ Cierre de sesion cancelado');
    this.mostrarModalCerrarSesion = false;
  }
}