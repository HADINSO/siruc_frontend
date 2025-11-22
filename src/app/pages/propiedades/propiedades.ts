import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './propiedades.html',
  styleUrl: './propiedades.css',
})
export class Propiedades {
  propiedades = [
    { id: 1, nombre: 'Tipo de Rubro', tipo: 'Lista', valores: 'Gastos, Ingresos', obligatorio: true },
    { id: 2, nombre: 'Nivel de Aprobación', tipo: 'Lista', valores: 'Bajo, Medio, Alto', obligatorio: true },
    { id: 3, nombre: 'Centro de Responsabilidad', tipo: 'Texto', valores: '-', obligatorio: false },
    { id: 4, nombre: 'Cuenta Contable', tipo: 'Número', valores: '-', obligatorio: true },
  ];
}
