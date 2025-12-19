import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  GestorInformacionService, 
  Ficha,
  CentroCostoRublo,
  DependenciaRublo,
  DetalleRubroPrincipal,
  DetalleRubroSecundario,
  DetalleRubroTerciario,
  DetalleRubroCuaternario,
  DetalleRubroQuinario,
  DetalleRubroSenario
} from '../../services/gestor-informacion.service';
import { CentrosCostoService, CentroCosto, Dependencia } from '../../services/centros-costo.service';
import { RubrosService, Periodo, RubroPrincipal, RubroSecundario, RubroTerciario, RubroCuaternario, RubroQuinario, RubroSenario } from '../../services/rubros.service';
import { ToastService } from '../../services/toast.service';

interface RubroSeleccionado {
  id: number;
  nombre: string;
  cuenta: string;
  seleccionado: boolean;
}

interface RubroConValores {
  tipo: 'principal' | 'secundario' | 'terciario' | 'cuaternario' | 'quinario' | 'senario';
  id: number;
  nombre: string;
  cuenta: string;
  valores: { [fichaId: number]: number };
  detalleIds: { [fichaId: number]: number };
  expandido?: boolean;
  hijos?: RubroConValores[];
  tieneHijos?: boolean;
}

@Component({
  selector: 'app-gestor-de-informacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestor-de-informacion.html',
  styleUrls: ['./gestor-de-informacion.css']
})
export class GestorDeInformacion implements OnInit {
  
  paso: 'relaciones' | 'fichas' | 'llenado' | 'historial' = 'relaciones';
  pestanaActivaRelaciones: 'centro' | 'dependencia' = 'centro';
  pestanaActivaLlenado: 'centro' | 'dependencia' = 'centro';
  
  periodos: Periodo[] = [];
  centrosCosto: CentroCosto[] = [];
  dependencias: Dependencia[] = [];
  rubrosPrincipalesDisponibles: RubroPrincipal[] = [];
  
  periodoSeleccionado: number | null = null;
  centroSeleccionado: number | null = null;
  dependenciaSeleccionada: number | null = null;
  
  rubrosSeleccionadosCentro: RubroSeleccionado[] = [];
  rubrosSeleccionadosDependencia: RubroSeleccionado[] = [];
  
  relacionesCentroCreadas: CentroCostoRublo[] = [];
  relacionesDependenciaCreadas: DependenciaRublo[] = [];
  
  fichas: Ficha[] = [];
  mostrarModalFichas = false;
  nuevaFicha = '';
  
  rubrosConValoresCentro: RubroConValores[] = [];
  rubrosConValoresDependencia: RubroConValores[] = [];
  
  cargando = false;
  guardando = false;

  // PROPIEDADES DEL MODAL
  mostrarModalLlenado = false;
  rubroSeleccionadoModal: RubroConValores | null = null;
  tipoModalLlenado: 'centro' | 'dependencia' = 'centro';

  constructor(
    private gestorService: GestorInformacionService,
    private centrosCostoService: CentrosCostoService,
    private rubrosService: RubrosService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
    setTimeout(() => this.cargarEstadoGuardado(), 1000);
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    
    this.rubrosService.getPeriodos().subscribe({
      next: (periodos) => {
        this.periodos = periodos;
        if (periodos.length > 0) {
          this.periodoSeleccionado = periodos[0].id;
          this.cargarRubrosPrincipales();
        }
      },
      error: (error) => console.error('Error al cargar períodos:', error)
    });
    
    this.centrosCostoService.getAllCentros().subscribe({
      next: (centros) => {
        this.centrosCosto = centros;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar centros:', error);
        this.cargando = false;
      }
    });
  }

  cargarRubrosPrincipales(): void {
    if (!this.periodoSeleccionado) return;
    
    this.rubrosService.getRubrosPrincipalesByPeriodo(this.periodoSeleccionado).subscribe({
      next: (rubros) => {
        this.rubrosPrincipalesDisponibles = rubros;
        
        this.rubrosSeleccionadosCentro = rubros.map(r => ({
          id: r.id!,
          nombre: r.nombre,
          cuenta: r.cuenta,
          seleccionado: false
        }));
        
        this.rubrosSeleccionadosDependencia = rubros.map(r => ({
          id: r.id!,
          nombre: r.nombre,
          cuenta: r.cuenta,
          seleccionado: false
        }));
        
        this.cargarYFiltrarRelacionesExistentes();
      },
      error: (error) => console.error('Error al cargar rubros principales:', error)
    });
  }

  cargarYFiltrarRelacionesExistentes(): void {
    if (!this.centroSeleccionado || !this.periodoSeleccionado) return;

    const promesas: Promise<any>[] = [];

    promesas.push(
      firstValueFrom(this.gestorService.getCentroCostoRublos()).then((relaciones: any) => {
        this.relacionesCentroCreadas = relaciones.filter((r: any) => 
          r.centro_costo_id === this.centroSeleccionado &&
          r.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        this.rubrosSeleccionadosCentro.forEach(rubro => {
          rubro.seleccionado = this.relacionesCentroCreadas.some(
            rel => rel.rublo_principal_id === rubro.id
          );
        });
      })
    );

    if (this.dependenciaSeleccionada) {
      promesas.push(
        firstValueFrom(this.gestorService.getDependenciasRublo()).then((relaciones: any) => {
          this.relacionesDependenciaCreadas = relaciones.filter((r: any) => 
            r.dependencia_id === this.dependenciaSeleccionada &&
            r.periodo_fiscal_id === this.periodoSeleccionado
          );
          
          this.rubrosSeleccionadosDependencia.forEach(rubro => {
            rubro.seleccionado = this.relacionesDependenciaCreadas.some(
              rel => rel.rublo_principal_id === rubro.id
            );
          });
        })
      );
    }

    Promise.all(promesas);
  }

  onChangePeriodo(): void {
    this.cargarRubrosPrincipales();
  }

  onChangeCentro(): void {
    if (!this.centroSeleccionado) {
      this.dependencias = [];
      this.dependenciaSeleccionada = null;
      return;
    }
    
    this.centrosCostoService.getAllDependencias().subscribe({
      next: (todasDependencias) => {
        this.dependencias = todasDependencias.filter(dep => {
          return Number(dep.centro_costo_id) === Number(this.centroSeleccionado);
        });
        
        if (this.dependencias.length > 0) {
          this.dependenciaSeleccionada = this.dependencias[0].id;
        }
        
        if (this.periodoSeleccionado) {
          this.cargarYFiltrarRelacionesExistentes();
        }
      },
      error: (error) => {
        console.error('Error al cargar dependencias:', error);
        this.toast.error('Error', 'No se pudieron cargar las dependencias');
      }
    });
  }

  cambiarPestanaRelaciones(pestana: 'centro' | 'dependencia'): void {
    this.pestanaActivaRelaciones = pestana;
  }

  cambiarPestanaLlenado(pestana: 'centro' | 'dependencia'): void {
    this.pestanaActivaLlenado = pestana;
  }

  agregarTodos(tipo: 'centro' | 'dependencia'): void {
    const rubros = tipo === 'centro' ? this.rubrosSeleccionadosCentro : this.rubrosSeleccionadosDependencia;
    rubros.forEach(r => r.seleccionado = true);
  }

  quitarTodos(tipo: 'centro' | 'dependencia'): void {
    const rubros = tipo === 'centro' ? this.rubrosSeleccionadosCentro : this.rubrosSeleccionadosDependencia;
    rubros.forEach(r => r.seleccionado = false);
  }

  validarRelaciones(): boolean {
    if (!this.periodoSeleccionado) {
      this.toast.warning('Campo requerido', 'Seleccione un período fiscal');
      return false;
    }
    
    if (!this.centroSeleccionado) {
      this.toast.warning('Campo requerido', 'Seleccione un centro de costo');
      return false;
    }
    
    if (!this.dependenciaSeleccionada) {
      this.toast.warning('Campo requerido', 'Seleccione una dependencia');
      return false;
    }
    
    const rubrosEnCentro = this.rubrosSeleccionadosCentro.filter(r => r.seleccionado);
    if (rubrosEnCentro.length === 0) {
      this.toast.warning('Rubros requeridos', 'Debe seleccionar al menos un rubro para el centro de costo');
      return false;
    }
    
    const rubrosEnDependencia = this.rubrosSeleccionadosDependencia.filter(r => r.seleccionado);
    if (rubrosEnDependencia.length === 0) {
      this.toast.warning('Rubros requeridos', 'Debe seleccionar al menos un rubro para la dependencia');
      return false;
    }
    
    return true;
  }

  continuarAFichas(): void {
    if (!this.validarRelaciones()) return;
    
    this.cargando = true;
    this.crearRelaciones().then(() => {
      this.paso = 'fichas';
      this.guardarEstado();
      this.cargando = false;
      this.cargarFichas();
    });
  }

  async crearRelaciones(): Promise<void> {
    const promesas: Promise<any>[] = [];

    const rubrosEnCentro = this.rubrosSeleccionadosCentro.filter(r => r.seleccionado);
    rubrosEnCentro.forEach(rubro => {
      const existe = this.relacionesCentroCreadas.some(
        rel => rel.rublo_principal_id === rubro.id
      );
      
      if (!existe) {
        const data = {
          centro_costo_id: this.centroSeleccionado!,
          rublo_principal_id: rubro.id,
          periodo_fiscal_id: this.periodoSeleccionado!
        };
        promesas.push(firstValueFrom(this.gestorService.createCentroCostoRublo(data)));
      }
    });

    const rubrosEnDependencia = this.rubrosSeleccionadosDependencia.filter(r => r.seleccionado);
    rubrosEnDependencia.forEach(rubro => {
      const existe = this.relacionesDependenciaCreadas.some(
        rel => rel.rublo_principal_id === rubro.id
      );
      
      if (!existe) {
        const data = {
          dependencia_id: this.dependenciaSeleccionada!,
          rublo_principal_id: rubro.id,
          periodo_fiscal_id: this.periodoSeleccionado!
        };
        promesas.push(firstValueFrom(this.gestorService.createDependenciaRublo(data)));
      }
    });

    await Promise.all(promesas);
  }

  cargarFichas(): void {
    this.gestorService.getFichas().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.fichas = response;
        } else {
          this.fichas = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar fichas:', error);
        this.fichas = [];
      }
    });
  }

  abrirModalFichas(): void {
    this.mostrarModalFichas = true;
  }

  cerrarModalFichas(): void {
    this.mostrarModalFichas = false;
    this.nuevaFicha = '';
  }

  crearFicha(): void {
    if (!this.nuevaFicha.trim()) {
      this.toast.warning('Campo requerido', 'Ingrese el nombre de la ficha');
      return;
    }
    
    this.gestorService.createFicha({ nombre: this.nuevaFicha }).subscribe({
      next: () => {
        this.toast.success('Creada', 'Ficha creada exitosamente');
        this.cargarFichas();
        this.cerrarModalFichas();
      },
      error: (error) => {
        console.error('Error al crear ficha:', error);
        this.toast.error('Error', 'No se pudo crear la ficha');
      }
    });
  }

  eliminarFicha(ficha: Ficha): void {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scale-in">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          
          <h3 class="text-xl font-bold text-slate-900 mb-2">¿Eliminar Ficha?</h3>
          
          <div class="text-left mb-6 bg-slate-50 rounded-lg p-4">
            <p class="text-slate-700 mb-3">
              <strong>Ficha:</strong> <span class="font-mono bg-slate-200 px-2 py-1 rounded">${ficha.nombre}</span>
            </p>
            <p class="text-sm text-slate-600 flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>Esta acción eliminará todos los valores asociados a esta ficha</span>
            </p>
            <p class="text-sm text-red-600 mt-2 font-semibold flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Esta acción no se puede deshacer
            </p>
          </div>
          
          <div class="flex gap-3 justify-center">
            <button 
              id="btn-cancelar-modal" 
              class="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-colors font-semibold flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Cancelar</span>
            </button>
            <button 
              id="btn-confirmar-modal" 
              class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-semibold flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const btnCancelar = document.getElementById('btn-cancelar-modal');
    const btnConfirmar = document.getElementById('btn-confirmar-modal');
    
    const cerrarModal = () => modal.remove();
    
    btnCancelar?.addEventListener('click', cerrarModal);
    
    btnConfirmar?.addEventListener('click', () => {
      cerrarModal();
      
      this.gestorService.deleteFicha(ficha.id).subscribe({
        next: () => {
          this.toast.success('Eliminada', `La ficha "${ficha.nombre}" ha sido eliminada`);
          this.cargarFichas();
        },
        error: (error) => {
          console.error('Error al eliminar ficha:', error);
          this.toast.error('Error', 'No se pudo eliminar la ficha');
        }
      });
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });
  }

  continuarALlenado(): void {
    if (!this.fichas || this.fichas.length === 0) {
      this.toast.warning('Fichas requeridas', 'Debe crear al menos una ficha');
      return;
    }
    
    this.cargando = true;
    this.cargarJerarquiasCompletas().then(() => {
      this.paso = 'llenado';
      this.guardarEstado();
      this.cargando = false;
    });
  }

  async cargarJerarquiasCompletas(): Promise<void> {
    const rubrosEnCentro = this.rubrosSeleccionadosCentro.filter(r => r.seleccionado);
    this.rubrosConValoresCentro = await Promise.all(
      rubrosEnCentro.map(r => this.construirJerarquia(r.id))
    );

    const rubrosEnDependencia = this.rubrosSeleccionadosDependencia.filter(r => r.seleccionado);
    this.rubrosConValoresDependencia = await Promise.all(
      rubrosEnDependencia.map(r => this.construirJerarquia(r.id))
    );

    await this.cargarValoresExistentes();
  }

  async cargarValoresExistentes(): Promise<void> {
    try {
      const detallesPrincipales = await firstValueFrom(this.gestorService.getAllDetallesRubroPrincipal());
      const detallesSecundarios = await firstValueFrom(this.gestorService.getAllDetallesRubroSecundario());
      const detallesTerciarios = await firstValueFrom(this.gestorService.getAllDetallesRubroTerciario());
      const detallesCuaternarios = await firstValueFrom(this.gestorService.getAllDetallesRubroCuaternario());
      const detallesQuinarios = await firstValueFrom(this.gestorService.getDetallesRubroQuinario());
      const detallesSenarios = await firstValueFrom(this.gestorService.getDetallesRubroSenario());

      this.aplicarValoresARubros(
        this.rubrosConValoresCentro, 
        detallesPrincipales || [], 
        detallesSecundarios || [], 
        detallesTerciarios || [],
        detallesCuaternarios || [],
        detallesQuinarios || [],
        detallesSenarios || []
      );
      this.aplicarValoresARubros(
        this.rubrosConValoresDependencia, 
        detallesPrincipales || [], 
        detallesSecundarios || [], 
        detallesTerciarios || [],
        detallesCuaternarios || [],
        detallesQuinarios || [],
        detallesSenarios || []
      );
    } catch (error) {
      console.error('Error al cargar valores:', error);
    }
  }

  aplicarValoresARubros(
    rubros: RubroConValores[],
    detallesPrincipales: DetalleRubroPrincipal[],
    detallesSecundarios: DetalleRubroSecundario[],
    detallesTerciarios: DetalleRubroTerciario[],
    detallesCuaternarios: DetalleRubroCuaternario[],
    detallesQuinarios: DetalleRubroQuinario[],
    detallesSenarios: DetalleRubroSenario[]
  ): void {
    rubros.forEach(rubro => {
      if (rubro.tipo === 'principal') {
        const detalles = detallesPrincipales.filter(d => 
          d.rublo_principal_id === rubro.id && 
          d.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        detalles.forEach(detalle => {
          rubro.valores[detalle.ficha_id] = detalle.valor;
          rubro.detalleIds[detalle.ficha_id] = detalle.id!;
        });
      } else if (rubro.tipo === 'secundario') {
        const detalles = detallesSecundarios.filter(d => 
          d.rublo_secundario_id === rubro.id && 
          d.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        detalles.forEach(detalle => {
          rubro.valores[detalle.ficha_id] = detalle.valor;
          rubro.detalleIds[detalle.ficha_id] = detalle.id!;
        });
      } else if (rubro.tipo === 'terciario') {
        const detalles = detallesTerciarios.filter(d => 
          d.rublo_terciario_id === rubro.id && 
          d.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        detalles.forEach(detalle => {
          rubro.valores[detalle.ficha_id] = detalle.valor;
          rubro.detalleIds[detalle.ficha_id] = detalle.id!;
        });
      } else if (rubro.tipo === 'cuaternario') {
        const detalles = detallesCuaternarios.filter(d => 
          d.rublo_cuaternario_id === rubro.id && 
          d.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        detalles.forEach(detalle => {
          rubro.valores[detalle.ficha_id] = detalle.valor;
          rubro.detalleIds[detalle.ficha_id] = detalle.id!;
        });
      } else if (rubro.tipo === 'quinario') {
        const detalles = detallesQuinarios.filter(d => 
          d.rublo_quinario_id === rubro.id && 
          d.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        detalles.forEach(detalle => {
          rubro.valores[detalle.ficha_id] = detalle.valor;
          rubro.detalleIds[detalle.ficha_id] = detalle.id!;
        });
      } else if (rubro.tipo === 'senario') {
        const detalles = detallesSenarios.filter(d => 
          d.rublo_senario_id === rubro.id && 
          d.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        detalles.forEach(detalle => {
          rubro.valores[detalle.ficha_id] = detalle.valor;
          rubro.detalleIds[detalle.ficha_id] = detalle.id!;
        });
      }

      if (rubro.hijos && rubro.hijos.length > 0) {
        this.aplicarValoresARubros(rubro.hijos, detallesPrincipales, detallesSecundarios, detallesTerciarios, detallesCuaternarios, detallesQuinarios, detallesSenarios);
      }
    });
  }

  async construirJerarquia(rubroPrincipalId: number): Promise<RubroConValores> {
    const principal = this.rubrosPrincipalesDisponibles.find(r => r.id === rubroPrincipalId);
    
    if (!principal) {
      throw new Error(`Rubro principal ${rubroPrincipalId} no encontrado`);
    }
    
    const jerarquia: RubroConValores = {
      tipo: 'principal',
      id: principal.id!,
      nombre: principal.nombre,
      cuenta: principal.cuenta,
      valores: {},
      detalleIds: {},
      expandido: true,
      hijos: [],
      tieneHijos: false
    };

    try {
      const secundarios = await firstValueFrom(this.rubrosService.getRubrosSecundariosByPrincipal(principal.id!));
      
      if (secundarios && secundarios.length > 0) {
        jerarquia.tieneHijos = true;
        
        for (const sec of secundarios) {
          const secundario: RubroConValores = {
            tipo: 'secundario',
            id: sec.id!,
            nombre: sec.nombre,
            cuenta: sec.cuenta,
            valores: {},
            detalleIds: {},
            expandido: false,
            hijos: [],
            tieneHijos: false
          };

          try {
            const terciarios = await firstValueFrom(this.rubrosService.getRubrosTerciariosBySecundario(sec.id!));
            
            if (terciarios && terciarios.length > 0) {
              secundario.tieneHijos = true;
              
              for (const ter of terciarios) {
                const terciario: RubroConValores = {
                  tipo: 'terciario',
                  id: ter.id!,
                  nombre: ter.nombre,
                  cuenta: ter.cuenta,
                  valores: {},
                  detalleIds: {},
                  expandido: false,
                  hijos: [],
                  tieneHijos: false
                };

                // NIVEL 4: CUATERNARIOS
                try {
                  const cuaternarios = await firstValueFrom(this.rubrosService.getRubrosCuaternariosByTerciario(ter.id!));
                  
                  if (cuaternarios && cuaternarios.length > 0) {
                    terciario.tieneHijos = true;
                    
                    for (const cuat of cuaternarios) {
                      const cuaternario: RubroConValores = {
                        tipo: 'cuaternario',
                        id: cuat.id!,
                        nombre: cuat.nombre,
                        cuenta: cuat.cuenta,
                        valores: {},
                        detalleIds: {},
                        expandido: false,
                        hijos: [],
                        tieneHijos: false
                      };

                      // NIVEL 5: QUINARIOS
                      try {
                        const quinarios = await firstValueFrom(this.rubrosService.getRubrosQuinariosByCuaternario(cuat.id!));
                        
                        if (quinarios && quinarios.length > 0) {
                          cuaternario.tieneHijos = true;
                          
                          for (const quin of quinarios) {
                            const quinario: RubroConValores = {
                              tipo: 'quinario',
                              id: quin.id!,
                              nombre: quin.nombre,
                              cuenta: quin.cuenta,
                              valores: {},
                              detalleIds: {},
                              expandido: false,
                              hijos: [],
                              tieneHijos: false
                            };

                            // NIVEL 6: SENARIOS
                            try {
                              const senarios = await firstValueFrom(this.rubrosService.getRubrosSenariosByQuinario(quin.id!));
                              
                              if (senarios && senarios.length > 0) {
                                quinario.tieneHijos = true;
                                
                                for (const sen of senarios) {
                                  quinario.hijos!.push({
                                    tipo: 'senario',
                                    id: sen.id!,
                                    nombre: sen.nombre,
                                    cuenta: sen.cuenta,
                                    valores: {},
                                    detalleIds: {},
                                    tieneHijos: false
                                  });
                                }
                              }
                            } catch (error) {
                              console.log(`No hay senarios para ${quin.cuenta}`);
                            }

                            cuaternario.hijos!.push(quinario);
                          }
                        }
                      } catch (error) {
                        console.log(`No hay quinarios para ${cuat.cuenta}`);
                      }

                      terciario.hijos!.push(cuaternario);
                    }
                  }
                } catch (error) {
                  console.log(`No hay cuaternarios para ${ter.cuenta}`);
                }

                secundario.hijos!.push(terciario);
              }
            }
          } catch (error) {
            console.log(`No hay terciarios para ${sec.cuenta}`);
          }

          jerarquia.hijos!.push(secundario);
        }
      }
    } catch (error) {
      console.log(`No hay secundarios para ${principal.cuenta}`);
    }

    return jerarquia;
  }

  toggleExpansion(rubro: RubroConValores): void {
    if (rubro.hijos && rubro.hijos.length > 0) {
      rubro.expandido = !rubro.expandido;
    }
  }

  // ==================== MÉTODOS DEL MODAL ====================
  
  abrirModalLlenado(rubro: RubroConValores, tipo: 'centro' | 'dependencia'): void {
    this.rubroSeleccionadoModal = rubro;
    this.tipoModalLlenado = tipo;
    this.mostrarModalLlenado = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalLlenado(): void {
    this.mostrarModalLlenado = false;
    this.rubroSeleccionadoModal = null;
    document.body.style.overflow = 'auto';
  }

  async guardarModalLlenado(): Promise<void> {
    if (!this.rubroSeleccionadoModal) return;

    this.guardando = true;
    const promesas: Promise<any>[] = [];

    const procesarRubro = (rubro: RubroConValores) => {
      for (const ficha of this.fichas) {
        const valor = rubro.valores[ficha.id];
        
        if (valor === undefined || valor === null || valor === 0) {
          continue;
        }

        const data: any = {
          ficha_id: ficha.id,
          periodo_fiscal_id: this.periodoSeleccionado!,
          valor: valor
        };

        if (rubro.tipo === 'principal') {
          data.rublo_principal_id = rubro.id;

          if (rubro.detalleIds[ficha.id]) {
            promesas.push(
              firstValueFrom(
                this.gestorService.updateDetalleRubroPrincipal(rubro.detalleIds[ficha.id], data)
              )
            );
          } else {
            promesas.push(
              firstValueFrom(
                this.gestorService.createDetalleRubroPrincipal(data)
              ).then((response: any) => {
                const id = response?.id || response?.data?.id;
                if (id) {
                  rubro.detalleIds[ficha.id] = id;
                }
              })
            );
          }
        } else if (rubro.tipo === 'secundario') {
          data.rublo_secundario_id = rubro.id;

          if (rubro.detalleIds[ficha.id]) {
            promesas.push(
              firstValueFrom(
                this.gestorService.updateDetalleRubroSecundario(rubro.detalleIds[ficha.id], data)
              )
            );
          } else {
            promesas.push(
              firstValueFrom(
                this.gestorService.createDetalleRubroSecundario(data)
              ).then((response: any) => {
                const id = response?.id || response?.data?.id;
                if (id) {
                  rubro.detalleIds[ficha.id] = id;
                }
              })
            );
          }
        } else if (rubro.tipo === 'terciario') {
          data.rublo_terciario_id = rubro.id;

          if (rubro.detalleIds[ficha.id]) {
            promesas.push(
              firstValueFrom(
                this.gestorService.updateDetalleRubroTerciario(rubro.detalleIds[ficha.id], data)
              )
            );
          } else {
            promesas.push(
              firstValueFrom(
                this.gestorService.createDetalleRubroTerciario(data)
              ).then((response: any) => {
                const id = response?.id || response?.data?.id;
                if (id) {
                  rubro.detalleIds[ficha.id] = id;
                }
              })
            );
          }
        } else if (rubro.tipo === 'cuaternario') {
          data.rublo_cuaternario_id = rubro.id;

          if (rubro.detalleIds[ficha.id]) {
            promesas.push(
              firstValueFrom(
                this.gestorService.updateDetalleRubroCuaternario(rubro.detalleIds[ficha.id], data)
              )
            );
          } else {
            promesas.push(
              firstValueFrom(
                this.gestorService.createDetalleRubroCuaternario(data)
              ).then((response: any) => {
                const id = response?.id || response?.data?.id;
                if (id) {
                  rubro.detalleIds[ficha.id] = id;
                }
              })
            );
          }
        } else if (rubro.tipo === 'quinario') {
          data.rublo_quinario_id = rubro.id;

          if (rubro.detalleIds[ficha.id]) {
            promesas.push(
              firstValueFrom(
                this.gestorService.updateDetalleRubroQuinario(rubro.detalleIds[ficha.id], data)
              )
            );
          } else {
            promesas.push(
              firstValueFrom(
                this.gestorService.createDetalleRubroQuinario(data)
              ).then((response: any) => {
                const id = response?.id || response?.data?.id;
                if (id) {
                  rubro.detalleIds[ficha.id] = id;
                }
              })
            );
          }
        } else if (rubro.tipo === 'senario') {
          data.rublo_senario_id = rubro.id;

          if (rubro.detalleIds[ficha.id]) {
            promesas.push(
              firstValueFrom(
                this.gestorService.updateDetalleRubroSenario(rubro.detalleIds[ficha.id], data)
              )
            );
          } else {
            promesas.push(
              firstValueFrom(
                this.gestorService.createDetalleRubroSenario(data)
              ).then((response: any) => {
                const id = response?.id || response?.data?.id;
                if (id) {
                  rubro.detalleIds[ficha.id] = id;
                }
              })
            );
          }
        }
      }

      if (rubro.hijos && rubro.hijos.length > 0) {
        rubro.hijos.forEach(hijo => procesarRubro(hijo));
      }
    };

    try {
      procesarRubro(this.rubroSeleccionadoModal);
      await Promise.all(promesas);
      this.toast.success('Éxito', 'Información guardada exitosamente');
      this.cerrarModalLlenado();
    } catch (error) {
      console.error('Error guardando información:', error);
      this.toast.error('Error', 'Error al guardar la información');
    } finally {
      this.guardando = false;
    }
  }

  // ==================== FIN MÉTODOS DEL MODAL ====================

  guardarRubro(rubro: RubroConValores, tipo: 'centro' | 'dependencia'): void {
    if (!this.fichas || this.fichas.length === 0) {
      this.toast.warning('Sin fichas', 'No hay fichas para guardar valores');
      return;
    }

    this.guardando = true;
    const promesas: Promise<any>[] = [];

    this.fichas.forEach(ficha => {
      const valor = rubro.valores[ficha.id];
      
      if (valor !== undefined && valor !== null && valor !== 0) {
        const detalleId = rubro.detalleIds[ficha.id];
        
        let data: any = {
          ficha_id: ficha.id,
          periodo_fiscal_id: this.periodoSeleccionado!,
          valor: valor
        };

        if (rubro.tipo === 'principal') {
          data.rublo_principal_id = rubro.id;
        } else if (rubro.tipo === 'secundario') {
          data.rublo_secundario_id = rubro.id;
        } else if (rubro.tipo === 'terciario') {
          data.rublo_terciario_id = rubro.id;
        } else if (rubro.tipo === 'cuaternario') {
          data.rublo_cuaternario_id = rubro.id;
        } else if (rubro.tipo === 'quinario') {
          data.rublo_quinario_id = rubro.id;
        } else if (rubro.tipo === 'senario') {
          data.rublo_senario_id = rubro.id;
        }

        if (detalleId) {
          let observable: Observable<any>;
          if (rubro.tipo === 'principal') {
            observable = this.gestorService.updateDetalleRubroPrincipal(detalleId, data);
          } else if (rubro.tipo === 'secundario') {
            observable = this.gestorService.updateDetalleRubroSecundario(detalleId, data);
          } else if (rubro.tipo === 'terciario') {
            observable = this.gestorService.updateDetalleRubroTerciario(detalleId, data);
          } else if (rubro.tipo === 'cuaternario') {
            observable = this.gestorService.updateDetalleRubroCuaternario(detalleId, data);
          } else if (rubro.tipo === 'quinario') {
            observable = this.gestorService.updateDetalleRubroQuinario(detalleId, data);
          } else {
            observable = this.gestorService.updateDetalleRubroSenario(detalleId, data);
          }
          
          promesas.push(firstValueFrom(observable));
        } else {
          let observable: Observable<any>;
          if (rubro.tipo === 'principal') {
            observable = this.gestorService.createDetalleRubroPrincipal(data);
          } else if (rubro.tipo === 'secundario') {
            observable = this.gestorService.createDetalleRubroSecundario(data);
          } else if (rubro.tipo === 'terciario') {
            observable = this.gestorService.createDetalleRubroTerciario(data);
          } else if (rubro.tipo === 'cuaternario') {
            observable = this.gestorService.createDetalleRubroCuaternario(data);
          } else if (rubro.tipo === 'quinario') {
            observable = this.gestorService.createDetalleRubroQuinario(data);
          } else {
            observable = this.gestorService.createDetalleRubroSenario(data);
          }
          
          promesas.push(
            firstValueFrom(observable).then((response: any) => {
              rubro.detalleIds[ficha.id] = response.id;
            })
          );
        }
      }
    });

    if (promesas.length === 0) {
      this.guardando = false;
      this.toast.warning('Sin valores', 'No hay valores para guardar');
      return;
    }

    Promise.all(promesas)
      .then(() => {
        this.guardando = false;
        this.toast.success('Guardado', `${rubro.cuenta} guardado exitosamente`);
      })
      .catch((error) => {
        this.guardando = false;
        console.error('Error al guardar:', error);
        this.toast.error('Error', 'No se pudo guardar el rubro');
      });
  }

  guardarTodo(tipo: 'centro' | 'dependencia'): void {
    const rubros = tipo === 'centro' ? this.rubrosConValoresCentro : this.rubrosConValoresDependencia;
    
    if (!this.fichas || this.fichas.length === 0) {
      this.toast.warning('Sin fichas', 'No hay fichas para guardar valores');
      return;
    }

    this.guardando = true;
    const promesas: Promise<any>[] = [];

    const procesarRubro = (rubro: RubroConValores) => {
      this.fichas.forEach(ficha => {
        const valor = rubro.valores[ficha.id];
        
        if (valor !== undefined && valor !== null && valor !== 0) {
          const detalleId = rubro.detalleIds[ficha.id];
          
          let data: any = {
            ficha_id: ficha.id,
            periodo_fiscal_id: this.periodoSeleccionado!,
            valor: valor
          };

          if (rubro.tipo === 'principal') {
            data.rublo_principal_id = rubro.id;
          } else if (rubro.tipo === 'secundario') {
            data.rublo_secundario_id = rubro.id;
          } else if (rubro.tipo === 'terciario') {
            data.rublo_terciario_id = rubro.id;
          } else if (rubro.tipo === 'cuaternario') {
            data.rublo_cuaternario_id = rubro.id;
          } else if (rubro.tipo === 'quinario') {
            data.rublo_quinario_id = rubro.id;
          } else if (rubro.tipo === 'senario') {
            data.rublo_senario_id = rubro.id;
          }

          if (detalleId) {
            let observable: Observable<any>;
            if (rubro.tipo === 'principal') {
              observable = this.gestorService.updateDetalleRubroPrincipal(detalleId, data);
            } else if (rubro.tipo === 'secundario') {
              observable = this.gestorService.updateDetalleRubroSecundario(detalleId, data);
            } else if (rubro.tipo === 'terciario') {
              observable = this.gestorService.updateDetalleRubroTerciario(detalleId, data);
            } else if (rubro.tipo === 'cuaternario') {
              observable = this.gestorService.updateDetalleRubroCuaternario(detalleId, data);
            } else if (rubro.tipo === 'quinario') {
              observable = this.gestorService.updateDetalleRubroQuinario(detalleId, data);
            } else {
              observable = this.gestorService.updateDetalleRubroSenario(detalleId, data);
            }
            promesas.push(firstValueFrom(observable));
          } else {
            let observable: Observable<any>;
            if (rubro.tipo === 'principal') {
              observable = this.gestorService.createDetalleRubroPrincipal(data);
            } else if (rubro.tipo === 'secundario') {
              observable = this.gestorService.createDetalleRubroSecundario(data);
            } else if (rubro.tipo === 'terciario') {
              observable = this.gestorService.createDetalleRubroTerciario(data);
            } else if (rubro.tipo === 'cuaternario') {
              observable = this.gestorService.createDetalleRubroCuaternario(data);
            } else if (rubro.tipo === 'quinario') {
              observable = this.gestorService.createDetalleRubroQuinario(data);
            } else {
              observable = this.gestorService.createDetalleRubroSenario(data);
            }
            
            promesas.push(
              firstValueFrom(observable).then((response: any) => {
                rubro.detalleIds[ficha.id] = response.id;
              })
            );
          }
        }
      });

      if (rubro.hijos && rubro.hijos.length > 0) {
        rubro.hijos.forEach(hijo => procesarRubro(hijo));
      }
    };

    rubros.forEach(rubro => procesarRubro(rubro));

    if (promesas.length === 0) {
      this.guardando = false;
      this.toast.warning('Sin valores', 'No hay valores para guardar');
      return;
    }

    console.log(`💾 Guardando ${promesas.length} registros...`);

    Promise.all(promesas)
      .then(() => {
        this.guardando = false;
        const tipoNombre = tipo === 'centro' ? 'Centro de Costo' : 'Dependencia';
        this.toast.success('¡Guardado!', `Todos los valores de ${tipoNombre} guardados exitosamente`);
        console.log(`✅ ${promesas.length} registros guardados`);
      })
      .catch((error) => {
        this.guardando = false;
        console.error('❌ Error al guardar:', error);
        this.toast.error('Error', 'No se pudieron guardar todos los valores');
      });
  }

  finalizar(): void {
    this.paso = 'historial';
    this.limpiarEstado();
    this.toast.success('Completado', 'Información guardada exitosamente');
  }

  volverAPaso(paso: 'relaciones' | 'fichas' | 'llenado'): void {
    this.paso = paso;
    this.guardarEstado();
  }

  descargarReporteCentro(): void {
    const centro = this.centrosCosto.find(c => c.id === this.centroSeleccionado);
    const periodo = this.periodos.find(p => p.id === this.periodoSeleccionado);
    
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte Centro - ${centro?.nombre}</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#333}.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #2563eb;padding-bottom:20px}.header h1{color:#1B4332;margin:5px 0;font-size:24px;text-transform:uppercase}.header h2{color:#40916C;margin:5px 0;font-size:18px}.header p{color:#6c757d;margin:5px 0;font-size:12px}.info{background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #2563eb}.info h3{color:#2563eb;margin-top:0;font-size:16px}.info p{margin:8px 0;font-size:14px}table{width:100%;border-collapse:collapse;margin:20px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)}th,td{border:1px solid #dee2e6;padding:12px 8px;text-align:left}th{background-color:#2563eb;color:white;font-weight:bold;text-transform:uppercase;font-size:12px}td{font-size:13px}.section{font-weight:bold;background-color:#dbeafe;font-size:14px}.subsection{padding-left:20px;background-color:#eff6ff}.subsubsection{padding-left:40px;background-color:#f8fafc}.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;font-size:10px;color:#6c757d}.numero{text-align:right;font-family:'Courier New',monospace}@media print{body{margin:0}.header{border-bottom:2px solid #000}}</style></head><body><div class="header"><h1>UNIVERSIDAD TECNOLÓGICA DEL CHOCÓ</h1><h2>SISTEMA DE GESTIÓN PRESUPUESTAL - SIRUC</h2><p>Sistema de Rubros y Centros de Costos</p></div><div class="info"><h3>REPORTE PRESUPUESTAL - CENTRO DE COSTO</h3><p><strong>Centro de Costo:</strong> ${centro?.nombre || 'N/A'}</p><p><strong>Período Fiscal:</strong> ${periodo?.anio || 'N/A'}</p><p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p><p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CO')}</p></div><table><thead><tr><th style="width:40%;">RUBRO</th>${this.fichas.map(f=>`<th class="numero">${f.nombre}</th>`).join('')}</tr></thead><tbody>`;
    this.rubrosConValoresCentro.forEach(rubro=>{html+=this.generarFilasRubro(rubro);});
    html+=`</tbody></table><div class="footer"><p><strong>Documento generado electrónicamente por SIRUC</strong></p><p>Universidad Tecnológica del Chocó - ${new Date().getFullYear()}</p></div></body></html>`;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=window.URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    const fecha=new Date().toISOString().split('T')[0];
    a.download=`Reporte_Centro_${centro?.nombre.replace(/\s+/g,'_')}_${fecha}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toast.success('Descargado','Reporte de Centro generado');
  }

  descargarReporteDependencia(): void {
    const dependencia=this.dependencias.find(d=>d.id===this.dependenciaSeleccionada);
    const periodo=this.periodos.find(p=>p.id===this.periodoSeleccionado);
    let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte Dependencia - ${dependencia?.nombre}</title><style>body{font-family:Arial,sans-serif;margin:20px;color:#333}.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #16a34a;padding-bottom:20px}.header h1{color:#1B4332;margin:5px 0;font-size:24px;text-transform:uppercase}.header h2{color:#40916C;margin:5px 0;font-size:18px}.header p{color:#6c757d;margin:5px 0;font-size:12px}.info{background:#f0fdf4;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #16a34a}.info h3{color:#16a34a;margin-top:0;font-size:16px}.info p{margin:8px 0;font-size:14px}table{width:100%;border-collapse:collapse;margin:20px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)}th,td{border:1px solid #dee2e6;padding:12px 8px;text-align:left}th{background-color:#16a34a;color:white;font-weight:bold;text-transform:uppercase;font-size:12px}td{font-size:13px}.section{font-weight:bold;background-color:#dcfce7;font-size:14px}.subsection{padding-left:20px;background-color:#f0fdf4}.subsubsection{padding-left:40px;background-color:#f8fafc}.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;font-size:10px;color:#6c757d}.numero{text-align:right;font-family:'Courier New',monospace}@media print{body{margin:0}.header{border-bottom:2px solid #000}}</style></head><body><div class="header"><h1>UNIVERSIDAD TECNOLÓGICA DEL CHOCÓ</h1><h2>SISTEMA DE GESTIÓN PRESUPUESTAL - SIRUC</h2><p>Sistema de Rubros y Centros de Costos</p></div><div class="info"><h3>REPORTE PRESUPUESTAL - DEPENDENCIA</h3><p><strong>Dependencia:</strong> ${dependencia?.nombre || 'N/A'}</p><p><strong>Período Fiscal:</strong> ${periodo?.anio || 'N/A'}</p><p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p><p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CO')}</p></div><table><thead><tr><th style="width:40%;">RUBRO</th>${this.fichas.map(f=>`<th class="numero">${f.nombre}</th>`).join('')}</tr></thead><tbody>`;
    this.rubrosConValoresDependencia.forEach(rubro=>{html+=this.generarFilasRubro(rubro);});
    html+=`</tbody></table><div class="footer"><p><strong>Documento generado electrónicamente por SIRUC</strong></p><p>Universidad Tecnológica del Chocó - ${new Date().getFullYear()}</p></div></body></html>`;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=window.URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    const fecha=new Date().toISOString().split('T')[0];
    a.download=`Reporte_Dependencia_${dependencia?.nombre.replace(/\s+/g,'_')}_${fecha}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toast.success('Descargado','Reporte de Dependencia generado');
  }

  descargarPDFCentro(): void {
    const centro=this.centrosCosto.find(c=>c.id===this.centroSeleccionado);
    const periodo=this.periodos.find(p=>p.id===this.periodoSeleccionado);
    const doc=new jsPDF('l','mm','a4');
    doc.setFontSize(20);doc.setTextColor(27,67,50);
    doc.text('UNIVERSIDAD TECNOLÓGICA DEL CHOCÓ',doc.internal.pageSize.getWidth()/2,15,{align:'center'});
    doc.setFontSize(16);doc.setTextColor(64,145,108);
    doc.text('Sistema de Gestión Presupuestal - SIRUC',doc.internal.pageSize.getWidth()/2,23,{align:'center'});
    doc.setFontSize(10);doc.setTextColor(108,117,125);
    doc.text('Sistema de Rubros y Centros de Costos',doc.internal.pageSize.getWidth()/2,29,{align:'center'});
    doc.setDrawColor(64,145,108);doc.setLineWidth(0.8);
    doc.line(20,32,doc.internal.pageSize.getWidth()-20,32);
    doc.setFontSize(14);doc.setTextColor(37,99,235);
    doc.setFont('helvetica','bold');
    doc.text('REPORTE PRESUPUESTAL - CENTRO DE COSTO',20,42);
    doc.setFontSize(10);doc.setTextColor(0,0,0);
    doc.setFont('helvetica','normal');
    doc.text(`Centro de Costo: ${centro?.nombre||'N/A'}`,20,50);
    doc.text(`Período Fiscal: ${periodo?.anio||'N/A'}`,20,56);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`,20,62);
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-CO')}`,20,68);
    const headers=['Rubro',...this.fichas.map(f=>f.nombre)];
    const data=this.construirDataParaPDF(this.rubrosConValoresCentro);
    autoTable(doc,{head:[headers],body:data,startY:75,theme:'grid',styles:{fontSize:8,cellPadding:3,font:'helvetica',lineColor:[200,200,200],lineWidth:0.1},headStyles:{fillColor:[37,99,235],textColor:[255,255,255],fontStyle:'bold',halign:'center',fontSize:9},columnStyles:{0:{cellWidth:'auto',fontStyle:'bold',halign:'left'}},alternateRowStyles:{fillColor:[248,250,252]},didParseCell:(data:any)=>{if(data.section==='body'&&data.column.index===0){const text=data.cell.text[0];if(text&&!text.startsWith('  ')){data.cell.styles.fillColor=[219,234,254];data.cell.styles.fontStyle='bold';data.cell.styles.fontSize=9;}else if(text&&text.startsWith('  ')&&!text.startsWith('    ')){data.cell.styles.fillColor=[239,246,255];data.cell.styles.fontSize=8;}else{data.cell.styles.fontSize=7;}}if(data.section==='body'&&data.column.index>0){data.cell.styles.halign='right';}}});
    const pageCount=doc.getNumberOfPages();
    for(let i=1;i<=pageCount;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(108,117,125);doc.text(`Página ${i} de ${pageCount}`,doc.internal.pageSize.getWidth()/2,doc.internal.pageSize.getHeight()-10,{align:'center'});doc.text('Documento generado por SIRUC - UTCH',doc.internal.pageSize.getWidth()/2,doc.internal.pageSize.getHeight()-6,{align:'center'});}
    const fecha=new Date().toISOString().split('T')[0];
    doc.save(`Reporte_Centro_${centro?.nombre.replace(/\s+/g,'_')}_${fecha}.pdf`);
    this.toast.success('PDF Generado','Reporte descargado exitosamente');
  }

  descargarPDFDependencia(): void {
    const dependencia=this.dependencias.find(d=>d.id===this.dependenciaSeleccionada);
    const periodo=this.periodos.find(p=>p.id===this.periodoSeleccionado);
    const doc=new jsPDF('l','mm','a4');
    doc.setFontSize(20);doc.setTextColor(27,67,50);
    doc.text('UNIVERSIDAD TECNOLÓGICA DEL CHOCÓ',doc.internal.pageSize.getWidth()/2,15,{align:'center'});
    doc.setFontSize(16);doc.setTextColor(64,145,108);
    doc.text('Sistema de Gestión Presupuestal - SIRUC',doc.internal.pageSize.getWidth()/2,23,{align:'center'});
    doc.setFontSize(10);doc.setTextColor(108,117,125);
    doc.text('Sistema de Rubros y Centros de Costos',doc.internal.pageSize.getWidth()/2,29,{align:'center'});
    doc.setDrawColor(64,145,108);doc.setLineWidth(0.8);
    doc.line(20,32,doc.internal.pageSize.getWidth()-20,32);
    doc.setFontSize(14);doc.setTextColor(22,163,74);
    doc.setFont('helvetica','bold');
    doc.text('REPORTE PRESUPUESTAL - DEPENDENCIA',20,42);
    doc.setFontSize(10);doc.setTextColor(0,0,0);
    doc.setFont('helvetica','normal');
    doc.text(`Dependencia: ${dependencia?.nombre||'N/A'}`,20,50);
    doc.text(`Período Fiscal: ${periodo?.anio||'N/A'}`,20,56);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`,20,62);
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-CO')}`,20,68);
    const headers=['Rubro',...this.fichas.map(f=>f.nombre)];
    const data=this.construirDataParaPDF(this.rubrosConValoresDependencia);
    autoTable(doc,{head:[headers],body:data,startY:75,theme:'grid',styles:{fontSize:8,cellPadding:3,font:'helvetica',lineColor:[200,200,200],lineWidth:0.1},headStyles:{fillColor:[22,163,74],textColor:[255,255,255],fontStyle:'bold',halign:'center',fontSize:9},columnStyles:{0:{cellWidth:'auto',fontStyle:'bold',halign:'left'}},alternateRowStyles:{fillColor:[248,250,252]},didParseCell:(data:any)=>{if(data.section==='body'&&data.column.index===0){const text=data.cell.text[0];if(text&&!text.startsWith('  ')){data.cell.styles.fillColor=[220,252,231];data.cell.styles.fontStyle='bold';data.cell.styles.fontSize=9;}else if(text&&text.startsWith('  ')&&!text.startsWith('    ')){data.cell.styles.fillColor=[240,253,244];data.cell.styles.fontSize=8;}else{data.cell.styles.fontSize=7;}}if(data.section==='body'&&data.column.index>0){data.cell.styles.halign='right';}}});
    const pageCount=doc.getNumberOfPages();
    for(let i=1;i<=pageCount;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(108,117,125);doc.text(`Página ${i} de ${pageCount}`,doc.internal.pageSize.getWidth()/2,doc.internal.pageSize.getHeight()-10,{align:'center'});doc.text('Documento generado por SIRUC - UTCH',doc.internal.pageSize.getWidth()/2,doc.internal.pageSize.getHeight()-6,{align:'center'});}
    const fecha=new Date().toISOString().split('T')[0];
    doc.save(`Reporte_Dependencia_${dependencia?.nombre.replace(/\s+/g,'_')}_${fecha}.pdf`);
    this.toast.success('PDF Generado','Reporte descargado exitosamente');
  }

  construirDataParaPDF(rubros:RubroConValores[],nivel:number=0):any[]{
    let data:any[]=[];
    rubros.forEach(rubro=>{
      const indentacion='  '.repeat(nivel);
      const fila=[indentacion+rubro.cuenta+' - '+rubro.nombre,...this.fichas.map(f=>{const valor=rubro.valores[f.id]||0;return '$'+valor.toLocaleString('es-CO');})];
      data.push(fila);
      if(rubro.hijos&&rubro.hijos.length>0){data=data.concat(this.construirDataParaPDF(rubro.hijos,nivel+1));}
    });
    return data;
  }

  generarFilasRubro(rubro:RubroConValores,nivel:number=0):string{
    let html='';
    const clase=nivel===0?'section':nivel===1?'subsection':'subsubsection';
    html+=`<tr class="${clase}">`;
    html+=`<td><strong>${rubro.cuenta}</strong> - ${rubro.nombre}</td>`;
    this.fichas.forEach(ficha=>{const valor=rubro.valores[ficha.id]||0;html+=`<td class="numero">$${valor.toLocaleString('es-CO')}</td>`;});
    html+=`</tr>`;
    if(rubro.hijos&&rubro.hijos.length>0){rubro.hijos.forEach(hijo=>{html+=this.generarFilasRubro(hijo,nivel+1);});}
    return html;
  }

  getNombreCentro():string{
    const centro=this.centrosCosto.find(c=>c.id===this.centroSeleccionado);
    return centro?centro.nombre:'';
  }

  getNombreDependencia():string{
    const dependencia=this.dependencias.find(d=>d.id===this.dependenciaSeleccionada);
    return dependencia?dependencia.nombre:'';
  }

  getNombrePeriodo():string{
    const periodo=this.periodos.find(p=>p.id===this.periodoSeleccionado);
    return periodo?periodo.anio.toString():'';
  }

  getFechaActual():string{
    return new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  }

  getHoraActual():string{
    return new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

  guardarEstado():void{
    const estado={paso:this.paso,periodoSeleccionado:this.periodoSeleccionado,centroSeleccionado:this.centroSeleccionado,dependenciaSeleccionada:this.dependenciaSeleccionada,rubrosSeleccionadosCentro:this.rubrosSeleccionadosCentro,rubrosSeleccionadosDependencia:this.rubrosSeleccionadosDependencia,pestanaActivaRelaciones:this.pestanaActivaRelaciones,pestanaActivaLlenado:this.pestanaActivaLlenado,timestamp:Date.now()};
    localStorage.setItem('gestor_informacion_estado',JSON.stringify(estado));
  }

  cargarEstadoGuardado():void{
    const estadoJSON=localStorage.getItem('gestor_informacion_estado');
    if(estadoJSON){
      try{
        const estado=JSON.parse(estadoJSON);
        const horasTranscurridas=(Date.now()-estado.timestamp)/(1000*60*60);
        if(horasTranscurridas>24){localStorage.removeItem('gestor_informacion_estado');return;}
        this.paso=estado.paso||'relaciones';
        this.periodoSeleccionado=estado.periodoSeleccionado;
        this.centroSeleccionado=estado.centroSeleccionado;
        this.dependenciaSeleccionada=estado.dependenciaSeleccionada;
        this.rubrosSeleccionadosCentro=estado.rubrosSeleccionadosCentro||[];
        this.rubrosSeleccionadosDependencia=estado.rubrosSeleccionadosDependencia||[];
        this.pestanaActivaRelaciones=estado.pestanaActivaRelaciones||'centro';
        this.pestanaActivaLlenado=estado.pestanaActivaLlenado||'centro';
        this.toast.info('Estado restaurado','Continuando donde lo dejaste');
        if(this.paso==='fichas'||this.paso==='llenado'||this.paso==='historial'){this.cargarFichas();}
        if(this.paso==='llenado'||this.paso==='historial'){setTimeout(()=>this.cargarJerarquiasCompletas(),500);}
      }catch(error){localStorage.removeItem('gestor_informacion_estado');}
    }
  }

  limpiarEstado():void{
    localStorage.removeItem('gestor_informacion_estado');
  }
}
