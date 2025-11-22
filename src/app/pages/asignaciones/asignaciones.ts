import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asignaciones.html',
  styleUrl: './asignaciones.css',
})
export class Asignaciones {
  asignaciones = [
    { id: 1, fecha: '2025-01-15', rubro: 'Personal', centroCosto: 'Facultad de Ingeniería', monto: 25000, estado: 'Aprobada' },
    { id: 2, fecha: '2025-01-20', rubro: 'Infraestructura', centroCosto: 'Facultad de Medicina', monto: 15000, estado: 'Pendiente' },
    { id: 3, fecha: '2025-01-25', rubro: 'Investigación', centroCosto: 'Facultad de Derecho', monto: 10000, estado: 'Aprobada' },
  ];

  getEstadoClase(estado: string): string {
    if (estado === 'Aprobada') return 'bg-[#D8F3DC] text-[#1B4332]';
    if (estado === 'Pendiente') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }
}
