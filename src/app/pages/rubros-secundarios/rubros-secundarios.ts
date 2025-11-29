import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RubrosService, Periodo, RubroPrincipal, RubroSecundario, RubroTerciario } from '../../services/rubros.service';
import { ToastService } from '../../services/toast.service';

interface RubroSecundarioExtended extends RubroSecundario {
  expandido: boolean;
  terciarios: RubroTerciario[];
  cantidadTerciarios: number;
  nombrePrincipal?: string;
}

@Component({
  selector: 'app-rubros-secundarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubros-secundarios.html',
  styleUrl: './rubros-secundarios.css',
})
export class RubrosSecundarios implements OnInit, OnDestroy {
  periodos: Periodo[] = [];
  rubrosPrincipales: RubroPrincipal[] = [];
  rubrosSecundarios: RubroSecundarioExtended[] = [];
  
  periodoSeleccionado: number | null = null;
  principalSeleccionado: number | null = null;
  
  mostrarModalPeriodo = false;
  mostrarModalRubro = false;
  modoEdicion = false;
  
  rubroSeleccionado: RubroSecundarioExtended | null = null;
  
  nuevoRubro = {
    nombre: '',
    cuenta: '',
    codigoNumero: ''
  };
  
  procesando = false;
  cargando = false;
  cargandoPeriodos = true;
  cargandoPrincipales = false;

  totalSecundarios = 0;
  totalTerciarios = 0;

  constructor(
    private rubrosService: RubrosService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  ngOnDestroy(): void {
    this.limpiarModalesHuerfanos();
  }

  private limpiarModalesHuerfanos(): void {
    const modales = document.querySelectorAll('[id^="confirm-dialog-"]');
    modales.forEach(modal => modal.remove());
  }

  cargarPeriodos(): void {
    this.cargandoPeriodos = true;
    this.rubrosService.getPeriodos().subscribe({
      next: (periodos) => {
        console.log('✅ Períodos recibidos del backend:', periodos);
        this.periodos = periodos;
        this.cargandoPeriodos = false;
        
        if (periodos.length > 0 && !this.periodoSeleccionado) {
          // Como el backend no devuelve campo "activo", seleccionamos el primero
          this.periodoSeleccionado = periodos[0].id;
          console.log('✅ Período seleccionado automáticamente:', periodos[0]);
          this.cargarPrincipales();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar períodos:', error);
        this.toast.error('Error', 'No se pudieron cargar los períodos fiscales');
        this.cargandoPeriodos = false;
      }
    });
  }

  seleccionarPeriodo(periodoId: number): void {
    this.periodoSeleccionado = periodoId;
    this.principalSeleccionado = null;  // ✅ Resetear principal al cambiar período
    this.rubrosSecundarios = [];
    this.mostrarModalPeriodo = false;
    this.cargarPrincipales();
  }

  cargarPrincipales(): void {
    if (!this.periodoSeleccionado) return;
    
    this.cargandoPrincipales = true;
    this.rubrosService.getRubrosPrincipalesByPeriodo(this.periodoSeleccionado).subscribe({
      next: (todosLosPrincipales) => {
        this.rubrosPrincipales = todosLosPrincipales.filter(p => p.periodo_fiscal_id === this.periodoSeleccionado);
        console.log('✅ Principales cargados:', this.rubrosPrincipales);
        this.cargandoPrincipales = false;
        
        if (this.rubrosPrincipales.length > 0) {
          if (!this.principalSeleccionado) {
            this.principalSeleccionado = this.rubrosPrincipales[0].id!;
            console.log('📌 Principal auto-seleccionado ID:', this.principalSeleccionado);
          }
          this.cargarSecundarios();
        } else {
          console.warn('⚠️ No hay principales para este período');
          this.principalSeleccionado = null;
          this.rubrosSecundarios = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar principales:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros principales');
        this.cargandoPrincipales = false;
      }
    });
  }

  onChangePrincipal(): void {
    if (this.principalSeleccionado) {
      this.cargarSecundarios();
    } else {
      this.rubrosSecundarios = [];
      this.totalSecundarios = 0;
    }
  }

  cargarSecundarios(): void {
    if (!this.principalSeleccionado) return;
    
    this.cargando = true;
    this.rubrosService.getRubrosSecundariosByPrincipal(this.principalSeleccionado).subscribe({
      next: (todosLosSecundarios) => {
        const secundarios = todosLosSecundarios.filter(s => s.rublo_principal_id === this.principalSeleccionado);
        
        this.rubrosSecundarios = secundarios.map(secundario => {
          const principal = this.rubrosPrincipales.find(p => p.id === secundario.rublo_principal_id);
          return {
            ...secundario,
            expandido: false,
            terciarios: [],
            cantidadTerciarios: 0,
            nombrePrincipal: principal?.nombre
          };
        });
        
        this.totalSecundarios = secundarios.length;
        
        this.rubrosSecundarios.forEach(secundario => {
          this.cargarTerciarios(secundario);
        });
        
        this.calcularTotalesGlobales();
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar secundarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros secundarios');
        this.cargando = false;
      }
    });
  }

  cargarTerciarios(secundario: RubroSecundarioExtended): void {
    if (!secundario.id) return;
    
    this.rubrosService.getRubrosTerciariosBySecundario(secundario.id).subscribe({
      next: (todosLosTerciarios) => {
        const terciarios = todosLosTerciarios.filter(t => t.rublo_secundario_id === secundario.id);
        secundario.terciarios = terciarios;
        secundario.cantidadTerciarios = terciarios.length;
        this.calcularTotalesGlobales();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar terciarios:', error);
        secundario.terciarios = [];
        secundario.cantidadTerciarios = 0;
      }
    });
  }

  calcularTotalesGlobales(): void {
    this.totalTerciarios = this.rubrosSecundarios.reduce(
      (total, rubro) => total + rubro.cantidadTerciarios, 0
    );
  }

  toggleExpandir(rubro: RubroSecundarioExtended): void {
    rubro.expandido = !rubro.expandido;
    
    if (rubro.expandido && rubro.terciarios.length === 0) {
      this.cargarTerciarios(rubro);
    }
  }

  abrirModalNuevoRubro(): void {
    console.log('🔍 abrirModalNuevoRubro - Estado actual:');
    console.log('   - periodoSeleccionado:', this.periodoSeleccionado);
    console.log('   - principalSeleccionado:', this.principalSeleccionado, typeof this.principalSeleccionado);
    console.log('   - rubrosPrincipales:', this.rubrosPrincipales.map(p => ({id: p.id, nombre: p.nombre})));
    
    if (!this.periodoSeleccionado) {
      this.toast.warning('Período requerido', 'Por favor selecciona un período fiscal');
      this.mostrarModalPeriodo = true;
      return;
    }

    if (!this.principalSeleccionado || this.principalSeleccionado === null) {
      console.error('❌ principalSeleccionado es null!');
      this.toast.error('Error', 'No hay rubro principal seleccionado. Selecciona uno del dropdown.');
      return;
    }
    
    // Verificar que el principal seleccionado existe en el array
    const principalExiste = this.rubrosPrincipales.find(p => p.id === this.principalSeleccionado);
    if (!principalExiste) {
      console.error('❌ El principal seleccionado no existe en el array!');
      console.error('   Buscando ID:', this.principalSeleccionado);
      console.error('   IDs disponibles:', this.rubrosPrincipales.map(p => p.id));
      this.toast.error('Error', 'El rubro principal seleccionado no es válido. Recarga la página.');
      return;
    }
    
    console.log('✅ Todo OK, abriendo modal');
    this.limpiarModalesHuerfanos();
    this.modoEdicion = false;
    this.nuevoRubro = { nombre: '', cuenta: '', codigoNumero: '' };
    this.mostrarModalRubro = true;
  }

  abrirModalEditarRubro(rubro: RubroSecundarioExtended): void {
    this.modoEdicion = true;
    this.rubroSeleccionado = rubro;
    
    const principal = this.rubrosPrincipales.find(p => p.id === rubro.rublo_principal_id);
    const codigoNumero = rubro.cuenta ? rubro.cuenta.replace(`${principal?.cuenta}-`, '') : '';
    
    this.nuevoRubro = { 
      nombre: rubro.nombre, 
      cuenta: rubro.cuenta,
      codigoNumero: codigoNumero
    };
    this.mostrarModalRubro = true;
  }

  cerrarModal(): void {
    this.mostrarModalRubro = false;
    this.nuevoRubro = { nombre: '', cuenta: '', codigoNumero: '' };
    this.rubroSeleccionado = null;
    this.modoEdicion = false;
  }

  guardarRubro(): void {
    if (!this.nuevoRubro.nombre.trim()) {
      this.toast.warning('Campo requerido', 'El nombre del rubro es requerido');
      return;
    }

    if (!this.nuevoRubro.codigoNumero.trim()) {
      this.toast.warning('Campo requerido', 'El código es requerido');
      return;
    }

    if (!/^\d+$/.test(this.nuevoRubro.codigoNumero)) {
      this.toast.warning('Código inválido', 'El código debe contener solo números');
      return;
    }

    if (!this.periodoSeleccionado) {
      this.toast.error('Error', 'No hay período seleccionado');
      return;
    }

    if (!this.principalSeleccionado) {
      this.toast.error('Error', 'No hay rubro principal seleccionado');
      return;
    }

    const principal = this.rubrosPrincipales.find(p => p.id === this.principalSeleccionado);
    if (!principal) {
      this.toast.error('Error', 'No se encontró el rubro principal');
      return;
    }

    const codigoCompleto = `${principal.cuenta}-${this.nuevoRubro.codigoNumero.padStart(2, '0')}`;

    // Validar código duplicado
    if (!this.modoEdicion) {
      const codigoExistente = this.rubrosSecundarios.find(r => r.cuenta === codigoCompleto);
      if (codigoExistente) {
        this.toast.error('Código duplicado', `El código ${codigoCompleto} ya está siendo usado por "${codigoExistente.nombre}"`);
        return;
      }
    } else if (this.rubroSeleccionado) {
      const codigoExistente = this.rubrosSecundarios.find(r => r.cuenta === codigoCompleto && r.id !== this.rubroSeleccionado?.id);
      if (codigoExistente) {
        this.toast.error('Código duplicado', `El código ${codigoCompleto} ya está siendo usado por "${codigoExistente.nombre}"`);
        return;
      }
    }

    this.procesando = true;

    if (this.modoEdicion && this.rubroSeleccionado && this.rubroSeleccionado.id) {
      const updateData = {
        nombre: this.nuevoRubro.nombre.trim(),
        cuenta: codigoCompleto
      };
      
      this.rubrosService.updateRubroSecundario(this.rubroSeleccionado.id, updateData).subscribe({
        next: () => {
          this.cargarSecundarios();
          this.toast.success('¡Actualizado!', 'El rubro ha sido actualizado exitosamente');
          this.procesando = false;
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar rubro:', error);
          this.toast.error('Error', 'No se pudo actualizar el rubro');
          this.procesando = false;
        }
      });
    } else {
      console.log('📝 Creando rubro secundario:');
      console.log('   - principalSeleccionado:', this.principalSeleccionado, typeof this.principalSeleccionado);
      console.log('   - periodoSeleccionado:', this.periodoSeleccionado, typeof this.periodoSeleccionado);
      
      // Validaciones estrictas
      if (!this.principalSeleccionado || this.principalSeleccionado === null || this.principalSeleccionado === undefined) {
        console.error('❌ principalSeleccionado es null/undefined!');
        this.toast.error('Error', 'Debes seleccionar un rubro principal del dropdown');
        this.procesando = false;
        return;
      }
      
      if (!this.periodoSeleccionado || this.periodoSeleccionado === null || this.periodoSeleccionado === undefined) {
        console.error('❌ periodoSeleccionado es null/undefined!');
        this.toast.error('Error', 'Debes seleccionar un período fiscal');
        this.procesando = false;
        return;
      }

      // Verificar que el principal existe
      const principalExiste = this.rubrosPrincipales.find(p => p.id === this.principalSeleccionado);
      if (!principalExiste) {
        console.error('❌ El principal no existe en el array!');
        console.error('   - Buscando ID:', this.principalSeleccionado);
        console.error('   - IDs disponibles:', this.rubrosPrincipales.map(p => p.id));
        this.toast.error('Error', 'El rubro principal seleccionado no es válido');
        this.procesando = false;
        return;
      }

      console.log('✅ Validaciones pasadas, creando data...');
      
      // Crear objeto plano con solo los campos necesarios
      const data = {
        nombre: this.nuevoRubro.nombre.trim(),
        cuenta: codigoCompleto,
        rublo_principal_id: Number(this.principalSeleccionado),
        periodo_fiscal_id: Number(this.periodoSeleccionado)
      };

      console.log('📤 Datos a enviar:', JSON.stringify(data, null, 2));
      console.log('📤 Tipo rublo_principal_id:', typeof data.rublo_principal_id, data.rublo_principal_id);
      console.log('📤 Tipo periodo_fiscal_id:', typeof data.periodo_fiscal_id, data.periodo_fiscal_id);

      this.rubrosService.createRubroSecundario(data).subscribe({
        next: (response) => {
          console.log('✅ Respuesta del backend:', response);
          this.cargarSecundarios();
          this.toast.success('¡Creado!', 'El rubro ha sido creado exitosamente');
          this.procesando = false;
          this.cerrarModal();
        },
        error: (error) => {
          console.error('❌ Error completo:', error);
          console.error('   - Status:', error.status);
          console.error('   - Status Text:', error.statusText);
          console.error('   - Error:', error.error);
          console.error('   - Message:', error.message);
          
          if (error.error && error.error.message) {
            this.toast.error('Error del Backend', error.error.message);
          } else if (error.error) {
            this.toast.error('Error', JSON.stringify(error.error));
          } else {
            this.toast.error('Error', 'No se pudo crear el rubro. Revisa la consola.');
          }
          this.procesando = false;
        }
      });
    }
  }

  async eliminarRubro(rubro: RubroSecundarioExtended): Promise<void> {
    if (!rubro.id) return;

    const confirmar = await this.mostrarConfirmacion(
      '¿Estás seguro?',
      `Al eliminar "${rubro.nombre}" se eliminarán también todos sus ${rubro.cantidadTerciarios} rubros terciarios. Esta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.procesando = true;
      this.rubrosService.deleteRubroSecundario(rubro.id).subscribe({
        next: () => {
          this.cargarSecundarios();
          this.limpiarModalesHuerfanos();
          this.toast.success('¡Eliminado!', 'El rubro y sus dependencias han sido eliminados');
          this.procesando = false;
        },
        error: (error) => {
          console.error('Error al eliminar rubro:', error);
          this.toast.error('Error', 'No se pudo eliminar el rubro');
          this.procesando = false;
        }
      });
    } else {
      this.limpiarModalesHuerfanos();
    }
  }

  getPeriodoNombre(): string {
    if (!this.periodoSeleccionado) return 'No seleccionado';
    const periodo = this.periodos.find(p => p.id === this.periodoSeleccionado);
    
    if (!periodo) {
      console.warn('⚠️ Período no encontrado:', this.periodoSeleccionado);
      return 'No encontrado';
    }
    
    // El backend solo devuelve {id, anio}, no tiene campo nombre
    return `${periodo.anio}`;
  }

  getPrincipalNombre(): string {
    console.log('🔍 getPrincipalNombre:', {
      principalSeleccionado: this.principalSeleccionado,
      principales: this.rubrosPrincipales,
      cantidad: this.rubrosPrincipales.length
    });
    
    if (!this.principalSeleccionado) return 'Ninguno';
    const principal = this.rubrosPrincipales.find(p => p.id === this.principalSeleccionado);
    
    if (!principal) {
      console.warn('⚠️ Principal no encontrado:', this.principalSeleccionado);
      return 'Desconocido';
    }
    
    return principal.nombre;
  }

  getPrincipalCodigo(principalId?: number): string {
    const id = principalId || this.principalSeleccionado;
    console.log('🔍 getPrincipalCodigo:', {
      id,
      principalSeleccionado: this.principalSeleccionado,
      principales: this.rubrosPrincipales.map(p => ({ id: p.id, cuenta: p.cuenta }))
    });
    
    if (!id) return 'RUB-000';
    const principal = this.rubrosPrincipales.find(p => p.id === id);
    
    if (!principal) {
      console.warn('⚠️ Principal no encontrado para ID:', id);
      return 'RUB-000';
    }
    
    console.log('✅ Código del principal:', principal.cuenta);
    return principal.cuenta || 'RUB-000';
  }

  getCodigoPreview(): string {
    const principalCodigo = this.getPrincipalCodigo();
    if (!this.nuevoRubro.codigoNumero) {
      return `${principalCodigo}-00`;
    }
    const numeroFormateado = this.nuevoRubro.codigoNumero.padStart(2, '0');
    const preview = `${principalCodigo}-${numeroFormateado}`;
    console.log('🔍 Preview del código:', preview);
    return preview;
  }

  getSecundarioCodigo(secundario: RubroSecundarioExtended): string {
    return secundario.cuenta || '';
  }

  getTerciarioCodigo(terciario: RubroTerciario, rubro: RubroSecundarioExtended): string {
    return terciario.cuenta || '';
  }

  private async mostrarConfirmacion(title: string, text: string): Promise<boolean> {
    return new Promise((resolve) => {
      const dialogId = `confirm-dialog-${Date.now()}`;
      
      const confirmHTML = `
        <div class="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in" style="background-color: rgba(0, 0, 0, 0.5);" id="${dialogId}">
          <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-scale-in">
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-orange-100">
                <svg class="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${title}</h3>
              <p class="text-gray-600 mb-6">${text}</p>
              <div class="flex gap-3 justify-center">
                <button id="btn-cancelar-${dialogId}" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors">
                  Cancelar
                </button>
                <button id="btn-confirmar-${dialogId}" class="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', confirmHTML);
      
      const dialog = document.getElementById(dialogId);
      const btnConfirmar = document.getElementById(`btn-confirmar-${dialogId}`);
      const btnCancelar = document.getElementById(`btn-cancelar-${dialogId}`);
      
      const cleanup = () => {
        if (dialog) dialog.remove();
        setTimeout(() => this.limpiarModalesHuerfanos(), 100);
      };
      
      btnConfirmar?.addEventListener('click', () => { cleanup(); resolve(true); }, { once: true });
      btnCancelar?.addEventListener('click', () => { cleanup(); resolve(false); }, { once: true });
      dialog?.addEventListener('click', (e) => { if (e.target === dialog) { cleanup(); resolve(false); }}, { once: true });
    });
  }
}
