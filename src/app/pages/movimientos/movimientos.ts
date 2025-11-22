import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
})
export class Movimientos {
  movimientos = [
    { id: 1, fecha: '2025-01-28', tipo: 'Egreso', concepto: 'Pago de Nómina', rubro: 'Personal', monto: 45000 },
    { id: 2, fecha: '2025-01-27', tipo: 'Egreso', concepto: 'Compra de Equipos', rubro: 'Infraestructura', monto: 12000 },
    { id: 3, fecha: '2025-01-26', tipo: 'Ingreso', concepto: 'Matrícula Estudiantes', rubro: 'Ingresos', monto: 80000 },
    { id: 4, fecha: '2025-01-25', tipo: 'Egreso', concepto: 'Servicios Públicos', rubro: 'Administración', monto: 5000 },
  ];

  getTipoClase(tipo: string): string {
    return tipo === 'Ingreso' ? 'bg-[#D8F3DC] text-[#1B4332]' : 'bg-orange-100 text-orange-800';
  }
}
