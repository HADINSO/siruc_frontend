import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatCardData {
  titulo: string;
  valor: number;
  icono: string;
  colorFondo: 'green' | 'yellow' | 'red' | 'pink';
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCardComponent {
  @Input() data: StatCardData = {
    titulo: 'Total',
    valor: 0,
    icono: 'users',
    colorFondo: 'green'
  };

  /**
   * Obtiene el color de fondo según el tipo
   */
  getColorFondo(): string {
    const colores: { [key: string]: string } = {
      'green': 'bg-gradient-to-br from-green-400 to-green-500',
      'yellow': 'bg-gradient-to-br from-yellow-300 to-yellow-400',
      'red': 'bg-gradient-to-br from-red-300 to-red-400',
      'pink': 'bg-gradient-to-br from-pink-300 to-pink-400'
    };
    return colores[this.data.colorFondo] || colores['green'];
  }

  /**
   * Obtiene el SVG del icono
   */
  getIconoSVG(): string {
    const iconos: { [key: string]: string } = {
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'financiera': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'shield': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'prohibition': 'M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return iconos[this.data.icono] || iconos['users'];
  }
}