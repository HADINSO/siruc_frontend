import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestorInformacionService } from '../services/gestor-informacion.service';

@Component({
  selector: 'app-relaciones-rubros',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Relaciones Centro/Dependencia ↔ Rubros</h2>
      
      <!-- Relaciones Centro -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4 text-blue-700">Centro de Costo ↔ Rubros</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-blue-100">
                <th class="border border-slate-300 px-4 py-2 text-left">ID</th>
                <th class="border border-slate-300 px-4 py-2 text-left">Centro de Costo</th>
                <th class="border border-slate-300 px-4 py-2 text-left">Rubro Principal</th>
                <th class="border border-slate-300 px-4 py-2 text-left">Período</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rel of centroRubros" class="hover:bg-slate-50">
                <td class="border border-slate-300 px-4 py-2">{{ rel.id }}</td>
                <td class="border border-slate-300 px-4 py-2">
                  <div *ngIf="rel.centro_costo">
                    <strong>{{ rel.centro_costo.nombre }}</strong>
                  </div>
                  <div *ngIf="!rel.centro_costo" class="text-slate-500">
                    ID: {{ rel.centro_costo_id }}
                  </div>
                </td>
                <td class="border border-slate-300 px-4 py-2">
                  <div *ngIf="rel.rublo_principal">
                    <span class="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{{ rel.rublo_principal.cuenta }}</span>
                    <span class="ml-2">{{ rel.rublo_principal.nombre }}</span>
                  </div>
                  <div *ngIf="!rel.rublo_principal" class="text-slate-500">
                    ID: {{ rel.rublo_principal_id }}
                  </div>
                </td>
                <td class="border border-slate-300 px-4 py-2">
                  <div *ngIf="rel.periodo_fiscal">
                    {{ rel.periodo_fiscal.anio }}
                  </div>
                  <div *ngIf="!rel.periodo_fiscal" class="text-slate-500">
                    ID: {{ rel.periodo_fiscal_id }}
                  </div>
                </td>
              </tr>
              <tr *ngIf="centroRubros.length === 0">
                <td colspan="4" class="border border-slate-300 px-4 py-2 text-center text-slate-500">
                  No hay relaciones de centros de costo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Relaciones Dependencia -->
      <div>
        <h3 class="text-xl font-semibold mb-4 text-green-700">Dependencia ↔ Rubros</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-green-100">
                <th class="border border-slate-300 px-4 py-2 text-left">ID</th>
                <th class="border border-slate-300 px-4 py-2 text-left">Dependencia</th>
                <th class="border border-slate-300 px-4 py-2 text-left">Rubro Principal</th>
                <th class="border border-slate-300 px-4 py-2 text-left">Período</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rel of dependenciaRubros" class="hover:bg-slate-50">
                <td class="border border-slate-300 px-4 py-2">{{ rel.id }}</td>
                <td class="border border-slate-300 px-4 py-2">
                  <div *ngIf="rel.dependencia">
                    <strong>{{ rel.dependencia.nombre }}</strong>
                    <span *ngIf="rel.dependencia.descripcion" class="text-sm text-slate-500 block">
                      {{ rel.dependencia.descripcion }}
                    </span>
                  </div>
                  <div *ngIf="!rel.dependencia" class="text-slate-500">
                    ID: {{ rel.dependencia_id }}
                  </div>
                </td>
                <td class="border border-slate-300 px-4 py-2">
                  <div *ngIf="rel.rublo_principal">
                    <span class="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{{ rel.rublo_principal.cuenta }}</span>
                    <span class="ml-2">{{ rel.rublo_principal.nombre }}</span>
                  </div>
                  <div *ngIf="!rel.rublo_principal" class="text-slate-500">
                    ID: {{ rel.rublo_principal_id }}
                  </div>
                </td>
                <td class="border border-slate-300 px-4 py-2">
                  <div *ngIf="rel.periodo_fiscal">
                    {{ rel.periodo_fiscal.anio }}
                  </div>
                  <div *ngIf="!rel.periodo_fiscal" class="text-slate-500">
                    ID: {{ rel.periodo_fiscal_id }}
                  </div>
                </td>
              </tr>
              <tr *ngIf="dependenciaRubros.length === 0">
                <td colspan="4" class="border border-slate-300 px-4 py-2 text-center text-slate-500">
                  No hay relaciones de dependencias
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Botón Recargar -->
      <div class="mt-6 text-center">
        <button 
          (click)="cargarRelaciones()"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
          🔄 Recargar Relaciones
        </button>
      </div>
    </div>
  `,
  styles: [`
    table {
      font-size: 0.875rem;
    }
  `]
})
export class RelacionesRubrosComponent implements OnInit {
  centroRubros: any[] = [];
  dependenciaRubros: any[] = [];

  constructor(private gestorService: GestorInformacionService) {}

  ngOnInit(): void {
    this.cargarRelaciones();
  }

  cargarRelaciones(): void {
    // Cargar centro_costo_rublo
    this.gestorService.getCentroCostoRublos().subscribe({
      next: (relaciones) => {
        this.centroRubros = relaciones;
        console.log('Centro-Rubros cargados:', relaciones);
      },
      error: (error) => console.error('Error al cargar centro-rubros:', error)
    });

    // Cargar dependencia_rublo
    this.gestorService.getDependenciasRublo().subscribe({
      next: (relaciones) => {
        this.dependenciaRubros = relaciones;
        console.log('Dependencia-Rubros cargados:', relaciones);
      },
      error: (error) => console.error('Error al cargar dependencia-rubros:', error)
    });
  }
}
