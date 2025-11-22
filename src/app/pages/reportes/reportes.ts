import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  reportes = [
    { 
      id: 1, 
      nombre: 'Reporte de Ejecución Presupuestal', 
      descripcion: 'Detalle de la ejecución por rubro y centro de costo',
      icono: 'chart',
      color: 'from-[#40916C] to-[#2D6A4F]'
    },
    { 
      id: 2, 
      nombre: 'Reporte de Movimientos', 
      descripcion: 'Listado de todos los ingresos y egresos del período',
      icono: 'list',
      color: 'from-[#52B788] to-[#40916C]'
    },
    { 
      id: 3, 
      nombre: 'Reporte de Centros de Costo', 
      descripcion: 'Análisis por centro de costo y responsable',
      icono: 'building',
      color: 'from-[#74C69D] to-[#52B788]'
    },
    { 
      id: 4, 
      nombre: 'Reporte Consolidado', 
      descripcion: 'Vista general del estado presupuestal',
      icono: 'file',
      color: 'from-[#95D5B2] to-[#74C69D]'
    },
  ];
}
