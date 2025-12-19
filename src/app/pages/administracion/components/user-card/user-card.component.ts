import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, UsuarioUtil } from '../../../../models/usuario.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCardComponent {
  @Input() usuario: Usuario = {
    id: 0,
    nombre: '',
    apellido: '',
    correo: '',
    username: '',
    rol_id: 0,
    permisos: [],
    elementos: []
  };

  @Output() editar = new EventEmitter<number>();
  @Output() eliminar = new EventEmitter<number>();

  /**
   * Obtiene las iniciales del usuario (nombre + apellido)
   */
  getInicial(): string {
    return UsuarioUtil.obtenerIniciales(this.usuario.nombre, this.usuario.apellido);
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getNombreCompleto(): string {
    return UsuarioUtil.getNombreCompleto(this.usuario.nombre, this.usuario.apellido);
  }

  /**
   * Obtiene el color del avatar
   */
  getColorAvatar(): string {
    return UsuarioUtil.obtenerColorAvatar(this.getInicial());
  }

  /**
   * Emite evento de edición
   */
  onEditar(): void {
    if (this.usuario.id) {
      console.log(`✏️ Editando usuario ${this.usuario.id}`);
      this.editar.emit(this.usuario.id);
    }
  }

  /**
   * Emite evento de eliminación
   */
  onEliminar(): void {
    if (this.usuario.id) {
      console.log(`🗑️ Eliminando usuario ${this.usuario.id}`);
      this.eliminar.emit(this.usuario.id);
    }
  }
}