import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent {
  @Input() mostrar: boolean = false;
  @Input() usuario: any = {};
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  modoEdicion = false;
  cambiarContrasena = false;
  tabActiva = 'info';

  usuarioEdit: any = {};

  contrasenaData = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  ngOnInit() {
    this.usuarioEdit = { ...this.usuario };
  }

  ngOnChanges() {
    if (this.mostrar) {
      this.resetearModal();
    }
  }

  resetearModal(): void {
    this.modoEdicion = false;
    this.cambiarContrasena = false;
    this.tabActiva = 'info';
    this.usuarioEdit = {
      nombre: this.usuario.nombre,
      rol: this.usuario.rol,
      email: this.usuario.email || 'austin.robertson@utch.edu.co',
      telefono: this.usuario.telefono || '+57 300 123 4567'
    };
    this.contrasenaData = { actual: '', nueva: '', confirmar: '' };
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
    this.modoEdicion = false;
    this.cambiarContrasena = false;
  }

  activarEdicion(): void {
    this.modoEdicion = true;
    this.usuarioEdit = {
      nombre: this.usuario.nombre,
      rol: this.usuario.rol,
      email: this.usuario.email || 'austin.robertson@utch.edu.co',
      telefono: this.usuario.telefono || '+57 300 123 4567'
    };
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.usuarioEdit = { ...this.usuario };
  }

  guardarCambios(): void {
    this.guardar.emit(this.usuarioEdit);
    this.modoEdicion = false;
  }

  toggleCambiarContrasena(): void {
    this.cambiarContrasena = !this.cambiarContrasena;
    if (!this.cambiarContrasena) {
      this.contrasenaData = { actual: '', nueva: '', confirmar: '' };
    }
  }

  guardarContrasena(): void {
    if (this.contrasenaData.nueva !== this.contrasenaData.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (this.contrasenaData.nueva.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    console.log('Cambiando contraseña...');
    this.cambiarContrasena = false;
    this.contrasenaData = { actual: '', nueva: '', confirmar: '' };
    alert('Contraseña actualizada exitosamente');
    // Aquí iría la llamada al backend
  }
}