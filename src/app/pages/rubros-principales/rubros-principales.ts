import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-rubros-principales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rubros-principales.html',
  styleUrl: './rubros-principales.css',
})
export class RubrosPrincipales {
  rubros = [
    { id: 1, codigo: 'RP-001', nombre: 'Personal', presupuesto: 150000, ejecutado: 135000, estado: 'Activo' },
    { id: 2, codigo: 'RP-002', nombre: 'Infraestructura', presupuesto: 80000, ejecutado: 65000, estado: 'Activo' },
    { id: 3, codigo: 'RP-003', nombre: 'Investigación', presupuesto: 60000, ejecutado: 48000, estado: 'Activo' },
    { id: 4, codigo: 'RP-004', nombre: 'Extensión', presupuesto: 40000, ejecutado: 32000, estado: 'Activo' },
    { id: 5, codigo: 'RP-005', nombre: 'Administración', presupuesto: 35000, ejecutado: 30000, estado: 'Activo' },
  ];

  getPorcentaje(ejecutado: number, presupuesto: number): number {
    return (ejecutado / presupuesto) * 100;
  }

  getDisponible(presupuesto: number, ejecutado: number): number {
    return presupuesto - ejecutado;
  }
}
