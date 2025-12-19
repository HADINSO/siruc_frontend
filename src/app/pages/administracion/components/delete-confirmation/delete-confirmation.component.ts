import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation.html',
  styleUrl: './delete-confirmation.css'
})
export class DeleteConfirmationComponent {
  @Input() mostrar: boolean = false;
  @Input() nombreUsuario: string = '';
  @Input() cargando: boolean = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  /**
   * Emite el evento de confirmación
   */
  onConfirmar(): void {
    if (!this.cargando) {
      console.log(`✅ Confirmando eliminación de ${this.nombreUsuario}`);
      this.confirmar.emit();
    }
  }

  /**
   * Emite el evento de cancelación
   */
  onCancelar(): void {
    console.log('❌ Cancelando eliminación');
    this.cancelar.emit();
  }
}