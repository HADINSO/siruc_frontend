import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { UsuarioService, DatosAPI } from '../../services/usuario.service';

interface UsuarioDetallado {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  rol: string;
  rolId: number;
  departamento: string;
  fechaIngreso: string;
  iniciales: string;
  usuario: string;
  estadisticas: {
    rubros: number;
    movimientos: number;
    asignaciones: number;
    aprobacion: number;
  };
  permisos: {
    nombre: string;
    descripcion: string;
    icono: string;
  }[];
  elementos: {
    nombre: string;
    icono: string;
  }[];
  insignias: string[];
}

@Component({
  selector: 'app-modal-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-perfil.html',
  styleUrl: './modal-perfil.css'
})
export class ModalPerfil implements OnInit {
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<UsuarioDetallado>();

  usuario: UsuarioDetallado = this.getUsuarioPorDefecto();
  editando: boolean = false;
  usuarioEditando: UsuarioDetallado = { ...this.usuario };
  cargando: boolean = false;
  error: string = '';

  constructor(
    private authService: Auth,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga los datos del usuario desde la API
   */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.usuarioService.obtenerPerfilActual().subscribe({
      next: (datos: DatosAPI) => {
        this.procesarDatosAPI(datos);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error = 'Error al cargar los datos del perfil';
        this.cargando = false;
      }
    });
  }

  /**
   * Procesa los datos recibidos de la API
   */
  private procesarDatosAPI(datos: DatosAPI): void {
    // Datos básicos de la persona
    this.usuario.nombre = datos.persona.nombre || '';
    this.usuario.apellido = datos.persona.apellido || '';
    this.usuario.email = datos.persona.correo || '';
    this.usuario.usuario = datos.username || '';
    this.usuario.rol = datos.rol.nombre || 'Usuario';
    this.usuario.rolId = datos.rol.id || 0;

    // Generar iniciales
    this.usuario.iniciales = this.obtenerIniciales(
      `${this.usuario.nombre} ${this.usuario.apellido}`
    );

    // Procesar elementos/permisos desde elemento_personas
    this.usuario.elementos = datos.persona.elemento_personas
      .filter(ep => ep.estado) // Solo elementos activos
      .map(ep => ({
        nombre: ep.elemento.nombre.trim(),
        icono: this.getIconoElemento(ep.elemento.nombre)
      }));

    // Procesar permisos desde permiso_personas
    this.usuario.permisos = datos.persona.permiso_personas.map(pp => ({
      nombre: pp.permiso.nombre,
      descripcion: `Código: ${pp.permiso.codigo}`,
      icono: this.getIconoPermiso(pp.permiso.nombre)
    }));

    // Estadísticas (calculadas)
    this.usuario.estadisticas = {
      rubros: datos.persona.elemento_personas.filter(
        ep => ep.elemento.nombre.toLowerCase().includes('rubro')
      ).length,
      movimientos: 0, // No viene en la API
      asignaciones: datos.persona.elemento_personas.filter(
        ep => ep.elemento.nombre.toLowerCase().includes('asignacion')
      ).length,
      aprobacion: 100 // Valor por defecto
    };

    // Insignias según el rol
    this.usuario.insignias = this.generarInsignias(datos.rol.nombre);

    // Datos adicionales
    this.usuario.departamento = 'Departamento';
    this.usuario.fechaIngreso = new Date(datos.persona.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.usuario.ubicacion = 'Edificio Administrativo';
    this.usuario.telefono = 'No disponible';

    // Copiar para edición
    this.usuarioEditando = { ...this.usuario };
  }

  /**
   * Obtiene el usuario por defecto (datos ficticios)
   */
  private getUsuarioPorDefecto(): UsuarioDetallado {
    return {
      nombre: 'Cargando...',
      apellido: '',
      email: '',
      telefono: 'No disponible',
      ubicacion: 'Edificio Administrativo',
      rol: 'Usuario',
      rolId: 0,
      departamento: 'Departamento',
      fechaIngreso: '',
      iniciales: 'U',
      usuario: '',
      estadisticas: {
        rubros: 0,
        movimientos: 0,
        asignaciones: 0,
        aprobacion: 0
      },
      permisos: [],
      elementos: [],
      insignias: []
    };
  }

  /**
   * Obtiene las iniciales del nombre
   */
  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  /**
   * Genera insignias según el rol
   */
  private generarInsignias(rol: string): string[] {
    const insignias: string[] = [];

    if (rol.toLowerCase().includes('admin')) {
      insignias.push('admin');
    } else {
      insignias.push('verified');
    }

    insignias.push('trusted');
    return insignias;
  }

  /**
   * Obtiene el ícono según el nombre del elemento
   */
  private getIconoElemento(nombre: string): string {
    nombre = nombre.toLowerCase();
    if (nombre.includes('rubro')) return '📊';
    if (nombre.includes('costo')) return '💰';
    if (nombre.includes('asignacion')) return '📋';
    if (nombre.includes('administracion')) return '⚙️';
    if (nombre.includes('gestor')) return '📂';
    return '✅';
  }

  /**
   * Obtiene el ícono para un permiso
   */
  private getIconoPermiso(permiso: string): string {
    permiso = permiso.toLowerCase();
    if (permiso.includes('crear')) return 'edit';
    if (permiso.includes('eliminar')) return 'trash';
    if (permiso.includes('ver') || permiso.includes('visualizar')) return 'eye';
    return 'check';
  }

  abrirEdicion(): void {
    this.editando = true;
    this.usuarioEditando = { ...this.usuario };
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.usuarioEditando = { ...this.usuario };
  }

  guardarCambios(): void {
    this.usuario = { ...this.usuarioEditando };
    this.editando = false;
    this.guardar.emit(this.usuario);
  }

  cerrarModal(): void {
    this.editando = false;
    this.cerrar.emit();
  }

  getIconoPermisoDato(icono: string): string {
    const iconos: { [key: string]: string } = {
      'edit': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      'check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'trash': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      'eye': 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'file': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      'activity': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };
    return iconos[icono] || iconos['check'];
  }

  getInsigniaColor(insignia: string): string {
    const colores: { [key: string]: string } = {
      'admin': 'bg-purple-100 text-purple-700',
      'expert': 'bg-blue-100 text-blue-700',
      'verified': 'bg-green-100 text-green-700',
      'trusted': 'bg-amber-100 text-amber-700'
    };
    return colores[insignia] || 'bg-gray-100 text-gray-700';
  }

  getInsigniaTexto(insignia: string): string {
    const textos: { [key: string]: string } = {
      'admin': '👑 Administrador',
      'expert': '⭐ Experto',
      'verified': '✓ Verificado',
      'trusted': '🛡️ De Confianza'
    };
    return textos[insignia] || insignia;
  }
}