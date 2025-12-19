import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuario.service';
import { Usuario, Estadisticas, UsuarioUtil } from '../../models/usuario.model';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { UserModalComponent } from './components/user-modal/user-modal.component';
import { DeleteConfirmationComponent } from './components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    UserCardComponent,
    UserModalComponent,
    DeleteConfirmationComponent
  ],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css'
})
export class AdministracionComponent implements OnInit {
  usuarios: Usuario[] = [];
  estadisticas: Estadisticas = {
    total: 0,
    financiera: 0,
    administradores: 0,
    inactivos: 0
  };

  // Datos para los selects del modal
  roles: any[] = [];
  permisos: any[] = [];
  elementos: any[] = [];

  // Estados de UI
  cargandoUsuarios = false;
  cargandoEstadisticas = false;
  cargandoRoles = false;
  cargandoPermisos = false;
  cargandoElementos = false;
  mostrarModal = false;
  mostrarDeleteConfirmation = false;
  usuarioEnEdicion: Usuario | null = null;
  usuarioAEliminar: Usuario | null = null;
  cargandoOperacion = false;

  // Notificaciones
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | 'info' = 'info';
  mostrarNotificacion = false;

  // Tarjetas de estadísticas
  estadisticasCards: any[] = [];

  constructor(private usuariosService: UsuariosService) {
    console.log('✅ AdministracionComponent inicializado');
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga usuarios, estadísticas, roles, permisos y elementos
   */
  cargarDatos(): void {
    this.cargarUsuarios();
    this.cargarEstadisticas();
    this.cargarRoles();
    this.cargarPermisos();
    this.cargarElementos();
  }

  /**
   * Obtiene la lista de usuarios
   */
  private cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        console.log('✅ Usuarios cargados:', usuarios);
        this.usuarios = usuarios;
        this.cargandoUsuarios = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.mostrarNotificacion_('Error al cargar usuarios', 'error');
        this.cargandoUsuarios = false;
      }
    });
  }

  /**
   * Obtiene las estadísticas
   */
  private cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    this.usuariosService.getEstadisticas().subscribe({
      next: (stats) => {
        console.log('✅ Estadísticas cargadas:', stats);
        this.estadisticas = stats;
        this.actualizarTarjetasEstadisticas();
        this.cargandoEstadisticas = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        this.mostrarNotificacion_('Error al cargar estadísticas', 'error');
        this.cargandoEstadisticas = false;
      }
    });
  }

  /**
   * Carga roles del backend
   */
  private cargarRoles(): void {
    this.cargandoRoles = true;
    this.usuariosService.getRoles().subscribe({
      next: (roles) => {
        console.log('✅ Roles cargados:', roles);
        this.roles = roles;
        this.cargandoRoles = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar roles:', error);
        this.roles = []; // Array vacío si hay error
        this.cargandoRoles = false;
      }
    });
  }

  /**
   * Carga permisos del backend
   */
  private cargarPermisos(): void {
    this.cargandoPermisos = true;
    this.usuariosService.getPermisos().subscribe({
      next: (permisos) => {
        console.log('✅ Permisos cargados:', permisos);
        this.permisos = permisos;
        this.cargandoPermisos = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar permisos:', error);
        this.permisos = []; // Array vacío si hay error
        this.cargandoPermisos = false;
      }
    });
  }

  /**
   * Carga elementos del backend
   */
  private cargarElementos(): void {
    this.cargandoElementos = true;
    this.usuariosService.getElementos().subscribe({
      next: (elementos) => {
        console.log('✅ Elementos cargados:', elementos);
        this.elementos = elementos;
        this.cargandoElementos = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar elementos:', error);
        this.elementos = []; // Array vacío si hay error
        this.cargandoElementos = false;
      }
    });
  }

  /**
   * Actualiza las tarjetas de estadísticas
   */
  private actualizarTarjetasEstadisticas(): void {
    this.estadisticasCards = [
      {
        titulo: 'Total Usuarios',
        valor: this.estadisticas.total,
        icono: 'users',
        colorFondo: 'green'
      },
      {
        titulo: 'Financiera',
        valor: this.estadisticas.financiera,
        icono: 'financiera',
        colorFondo: 'yellow'
      },
      {
        titulo: 'Administradores',
        valor: this.estadisticas.administradores,
        icono: 'shield',
        colorFondo: 'yellow'
      },
      {
        titulo: 'Inactivos',
        valor: this.estadisticas.inactivos,
        icono: 'prohibition',
        colorFondo: 'pink'
      }
    ];
  }

  /**
   * Abre el modal para crear nuevo usuario
   */
  abrirModalCrear(): void {
    this.usuarioEnEdicion = null;
    this.mostrarModal = true;
    console.log('📝 Modal de crear usuario abierto');
  }

  /**
   * Abre el modal para editar un usuario
   */
  abrirModalEditar(usuarioId: number): void {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    if (usuario) {
      this.usuarioEnEdicion = usuario;
      this.mostrarModal = true;
      console.log(`✏️ Modal de editar usuario ${usuarioId} abierto`);
    }
  }

  /**
   * Maneja el evento de guardar del modal
   */
  onGuardarUsuario(datosUsuario: Omit<Usuario, 'id'>): void {
    if (this.usuarioEnEdicion) {
      // EDITAR
      this.editarUsuario(this.usuarioEnEdicion.id as number, datosUsuario);
    } else {
      // CREAR
      this.crearUsuario(datosUsuario);
    }
  }

  /**
   * Crea un nuevo usuario
   */
  private crearUsuario(datosUsuario: Omit<Usuario, 'id'>): void {
    this.cargandoOperacion = true;
    this.usuariosService.crearUsuario(datosUsuario).subscribe({
      next: (usuarioCreado) => {
        console.log('✅ Usuario creado:', usuarioCreado);
        this.mostrarNotificacion_(
          `Usuario ${UsuarioUtil.getNombreCompleto(usuarioCreado.nombre, usuarioCreado.apellido)} creado exitosamente`,
          'exito'
        );
        this.mostrarModal = false;
        this.cargarDatos();
        this.cargandoOperacion = false;
      },
      error: (error) => {
        console.error('❌ Error al crear usuario:', error);
        this.mostrarNotificacion_('Error al crear usuario', 'error');
        this.cargandoOperacion = false;
      }
    });
  }

  /**
   * Edita un usuario existente
   */
  private editarUsuario(usuarioId: number, datosActualizados: Omit<Usuario, 'id'>): void {
    this.cargandoOperacion = true;
    this.usuariosService.actualizarUsuario(usuarioId, datosActualizados).subscribe({
      next: (usuarioActualizado) => {
        console.log('✅ Usuario actualizado:', usuarioActualizado);
        this.mostrarNotificacion_(
          `Usuario ${UsuarioUtil.getNombreCompleto(usuarioActualizado.nombre, usuarioActualizado.apellido)} actualizado exitosamente`,
          'exito'
        );
        this.mostrarModal = false;
        this.cargarDatos();
        this.cargandoOperacion = false;
      },
      error: (error) => {
        console.error('❌ Error al actualizar usuario:', error);
        this.mostrarNotificacion_('Error al actualizar usuario', 'error');
        this.cargandoOperacion = false;
      }
    });
  }

  /**
   * Cancela la edición del modal
   */
  onCancelarModal(): void {
    this.mostrarModal = false;
    this.usuarioEnEdicion = null;
  }

  /**
   * Abre el modal de confirmación de eliminación
   */
  abrirDeleteConfirmation(usuarioId: number): void {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    if (usuario) {
      this.usuarioAEliminar = usuario;
      this.mostrarDeleteConfirmation = true;
      console.log(`🗑️ Confirmación de eliminación abierta para ${UsuarioUtil.getNombreCompleto(usuario.nombre, usuario.apellido)}`);
    }
  }

  /**
   * Confirma la eliminación del usuario
   */
  onConfirmarEliminar(): void {
    if (this.usuarioAEliminar) {
      this.eliminarUsuario(this.usuarioAEliminar.id as number);
    }
  }

  /**
   * Cancela la eliminación
   */
  onCancelarDelete(): void {
    this.mostrarDeleteConfirmation = false;
    this.usuarioAEliminar = null;
  }

  /**
   * Elimina un usuario
   */
  private eliminarUsuario(usuarioId: number): void {
    this.cargandoOperacion = true;
    this.usuariosService.eliminarUsuario(usuarioId).subscribe({
      next: () => {
        const nombreUsuario = this.usuarioAEliminar 
          ? UsuarioUtil.getNombreCompleto(this.usuarioAEliminar.nombre, this.usuarioAEliminar.apellido)
          : 'Usuario';
        console.log(`✅ Usuario ${usuarioId} eliminado`);
        this.mostrarNotificacion_(`${nombreUsuario} eliminado exitosamente`, 'exito');
        this.mostrarDeleteConfirmation = false;
        this.usuarioAEliminar = null;
        this.cargarDatos();
        this.cargandoOperacion = false;
      },
      error: (error) => {
        console.error('❌ Error al eliminar usuario:', error);
        this.mostrarNotificacion_('Error al eliminar usuario', 'error');
        this.cargandoOperacion = false;
      }
    });
  }

  /**
   * Muestra una notificación
   */
  private mostrarNotificacion_(mensaje: string, tipo: 'exito' | 'error' | 'info'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    this.mostrarNotificacion = true;

    // Ocultar después de 4 segundos
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 4000);
  }

  /**
   * Cierra la notificación manualmente
   */
  cerrarNotificacion(): void {
    this.mostrarNotificacion = false;
  }
}