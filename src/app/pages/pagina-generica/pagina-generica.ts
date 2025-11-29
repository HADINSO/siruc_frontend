import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pagina-generica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagina-generica.html',
  styleUrl: './pagina-generica.css',
})
export class PaginaGenerica implements OnInit {
  nombreModulo: string = '';
  rutaActual: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.rutaActual = this.route.snapshot.url.join('/');
    this.nombreModulo = this.formatearNombre(this.rutaActual);
  }

  formatearNombre(ruta: string): string {
    return ruta
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
