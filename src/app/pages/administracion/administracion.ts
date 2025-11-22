import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-administracion',
  imports: [CommonModule],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
})
export class Administracion {
  usuarios = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@utch.edu.co', rol: 'Administrador', estado: 'Activo' },
    { id: 2, nombre: 'María García', email: 'maria.garcia@utch.edu.co', rol: 'Gestor', estado: 'Activo' },
    { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@utch.edu.co', rol: 'Consultor', estado: 'Activo' },
    { id: 4, nombre: 'Ana Martínez', email: 'ana.martinez@utch.edu.co', rol: 'Gestor', estado: 'Inactivo' },
  ];

  getRolClase(rol: string): string {
    if (rol === 'Administrador') return 'bg-purple-100 text-purple-800';
    if (rol === 'Gestor') return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-600';
  }

  getEstadoClase(estado: string): string {
    return estado === 'Activo' ? 'bg-[#D8F3DC] text-[#1B4332]' : 'bg-slate-100 text-slate-600';
  }
}
