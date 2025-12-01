import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private historial: string[] = [];

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {
    this.inicializarHistorial();
  }

  private inicializarHistorial(): void {
    // Escuchar cambios de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.historial.push(event.urlAfterRedirects);
        console.log('📍 URL agregada al historial:', event.urlAfterRedirects);
      });

    // Prevenir retroceso del navegador
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('popstate', (event) => {
        console.log('🔙 Intento de retroceso detectado');
        window.history.forward();
      });
    });
  }

  limpiarHistorial(): void {
    this.historial = [];
    console.log('🗑️ Historial limpiado');
  }
}