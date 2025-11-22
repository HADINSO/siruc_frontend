import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  estadisticas = {
    presupuestoTotal: {
      valor: '$365K',
      cambio: '+12.5% vs mes anterior',
      porcentaje: 12.5
    },
    ejecutado: {
      valor: '$310K',
      porcentaje: '84.9% del total'
    },
    disponible: {
      valor: '$55K',
      porcentaje: '15.1% restante'
    }
  };

  ventasBrutas = '$855.8K';

  centrosCosto = [
    { nombre: 'Facultad de Ingeniería', asignado: 150000, ejecutado: 135000, porcentaje: 90 },
    { nombre: 'Facultad de Medicina', asignado: 120000, ejecutado: 98000, porcentaje: 81.7 },
    { nombre: 'Facultad de Derecho', asignado: 80000, ejecutado: 67000, porcentaje: 83.8 },
    { nombre: 'Administración Central', asignado: 60000, ejecutado: 45000, porcentaje: 75 },
  ];

  centrosCostoDistribucion = [
    { name: 'Facultad de Ingeniería', value: 135000, color: '#1B4332', porcentaje: 35 },
    { name: 'Facultad de Medicina', value: 98000, color: '#2D6A4F', porcentaje: 26 },
    { name: 'Facultad de Derecho', value: 67000, color: '#40916C', porcentaje: 18 },
    { name: 'Administración Central', value: 45000, color: '#52B788', porcentaje: 12 },
    { name: 'Otros', value: 35000, color: '#95D5B2', porcentaje: 9 },
  ];

  getDisponible(asignado: number, ejecutado: number): number {
    return asignado - ejecutado;
  }

  getEstadoClase(porcentaje: number): string {
    if (porcentaje > 85) return 'bg-[#D8F3DC] text-[#1B4332]';
    if (porcentaje > 70) return 'bg-[#95D5B2]/30 text-[#2D6A4F]';
    return 'bg-orange-100 text-orange-800';
  }

  getEstadoTexto(porcentaje: number): string {
    if (porcentaje > 85) return 'Óptimo';
    if (porcentaje > 70) return 'Normal';
    return 'Atención';
  }

  getBarraColorClase(porcentaje: number): string {
    if (porcentaje > 85) return 'bg-[#52B788]';
    if (porcentaje > 70) return 'bg-[#40916C]';
    return 'bg-[#95D5B2]';
  }
}