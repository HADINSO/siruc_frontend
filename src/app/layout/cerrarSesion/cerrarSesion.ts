import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cerrar-sesion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cerrarSesion.html',
  styleUrl: './cerrarSesion.css'
})
export class CerrarSesionComponent {
  @Input() mostrar: boolean = false;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  confirmarCierre(): void {
    console.log('✅ Confirmando cierre de sesion...');
    this.confirmar.emit();
  }

  cancelarCierre(): void {
    console.log('❌ Cierre de sesion cancelado');
    this.cancelar.emit();
  }
}