import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-centros-cost',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './centros-cost.html',
  styleUrl: './centros-cost.css',
})
export class CentrosCost {
  centros = [
    { id: 1, codigo: 'CC-001', nombre: 'Facultad de Ingeniería', tipo: 'Académico', responsable: 'Juan Pérez', estado: 'Activo' },
    { id: 2, codigo: 'CC-002', nombre: 'Facultad de Medicina', tipo: 'Académico', responsable: 'María García', estado: 'Activo' },
    { id: 3, codigo: 'CC-003', nombre: 'Facultad de Derecho', tipo: 'Académico', responsable: 'Carlos López', estado: 'Activo' },
    { id: 4, codigo: 'CC-004', nombre: 'Administración Central', tipo: 'Administrativo', responsable: 'Ana Martínez', estado: 'Activo' },
  ];
}
