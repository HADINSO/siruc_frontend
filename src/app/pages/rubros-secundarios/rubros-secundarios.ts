import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-rubros-secundarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rubros-secundarios.html',
  styleUrl: './rubros-secundarios.css',
})
export class RubrosSecundarios {
  rubros = [
    { id: 1, codigo: 'RS-001', nombre: 'Salarios Docentes', rubroPadre: 'Personal', presupuesto: 90000, ejecutado: 85000 },
    { id: 2, codigo: 'RS-002', nombre: 'Salarios Administrativos', rubroPadre: 'Personal', presupuesto: 60000, ejecutado: 50000 },
    { id: 3, codigo: 'RS-003', nombre: 'Construcción', rubroPadre: 'Infraestructura', presupuesto: 50000, ejecutado: 40000 },
    { id: 4, codigo: 'RS-004', nombre: 'Mantenimiento', rubroPadre: 'Infraestructura', presupuesto: 30000, ejecutado: 25000 },
  ];

  getPorcentaje(ejecutado: number, presupuesto: number): number {
    return (ejecutado / presupuesto) * 100;
  }
}
