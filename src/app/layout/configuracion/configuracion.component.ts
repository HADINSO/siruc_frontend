import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  // Estado de notificaciones
  notificacionesActivas: boolean = true;

  // Modal de cambiar contraseña
  mostrarModalContrasena: boolean = false;
  ultimoCambioContrasena: string = 'Hace 3 meses';

  // Formulario de cambiar contraseña
  formularioContrasena = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  constructor() {}

  ngOnInit(): void {
    // Inicializar datos si es necesario
    console.log('✅ ConfiguracionComponent inicializado');
  }

  /**
   * Toggle para activar/desactivar notificaciones
   */
  toggleNotificaciones(): void {
    this.notificacionesActivas = !this.notificacionesActivas;
    console.log('🔔 Notificaciones:', this.notificacionesActivas ? 'Activadas' : 'Desactivadas');
  }

  /**
   * Abrir modal de cambiar contraseña
   */
  abrirModalCambiarContrasena(): void {
    this.mostrarModalContrasena = true;
    this.limpiarFormularioContrasena();
    console.log('🔐 Modal de cambiar contraseña abierto');
  }

  /**
   * Cerrar modal de cambiar contraseña
   */
  cerrarModalCambiarContrasena(): void {
    this.mostrarModalContrasena = false;
    this.limpiarFormularioContrasena();
    console.log('✖️ Modal de cambiar contraseña cerrado');
  }

  /**
   * Guardar nueva contraseña
   */
  guardarContrasena(): void {
    console.log('💾 Intentando guardar contraseña...');

    // Validaciones básicas
    if (!this.formularioContrasena.actual) {
      console.error('❌ Ingresa la contraseña actual');
      alert('Por favor ingresa la contraseña actual');
      return;
    }

    if (!this.formularioContrasena.nueva) {
      console.error('❌ Ingresa la nueva contraseña');
      alert('Por favor ingresa la nueva contraseña');
      return;
    }

    if (!this.formularioContrasena.confirmar) {
      console.error('❌ Confirma la nueva contraseña');
      alert('Por favor confirma la nueva contraseña');
      return;
    }

    if (this.formularioContrasena.nueva !== this.formularioContrasena.confirmar) {
      console.error('❌ Las contraseñas no coinciden');
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.formularioContrasena.nueva.length < 8) {
      console.error('❌ La contraseña debe tener al menos 8 caracteres');
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    console.log('✅ Contraseña actualizada exitosamente');
    alert('✅ Contraseña actualizada exitosamente');
    
    // Aquí iría la llamada a la API para cambiar contraseña
    // this.usuarioService.cambiarContraseña({
    //   actual: this.formularioContraseña.actual,
    //   nueva: this.formularioContraseña.nueva
    // }).subscribe(...)

    // Cerrar modal y mostrar mensaje de éxito
    this.cerrarModalCambiarContrasena();
    this.ultimoCambioContrasena = 'Hace unos momentos';
  }

  /**
   * Limpiar formulario de contraseña
   */
  private limpiarFormularioContrasena(): void {
    this.formularioContrasena = {
      actual: '',
      nueva: '',
      confirmar: ''
    };
  }

  /**
   * Cerrar modal principal
   */
  cerrarModal(): void {
    this.mostrarModalContrasena = false;
    this.limpiarFormularioContrasena();
    this.cerrar.emit();
    console.log('✖️ Modal de configuración cerrado');
  }
}