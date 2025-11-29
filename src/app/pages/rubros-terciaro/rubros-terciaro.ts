import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RubrosService, Periodo, RubroPrincipal, RubroSecundario, RubroTerciario } from '../../services/rubros.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-rubros-terciarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubros-terciaro.html',
  styleUrl: './rubros-terciaro.css',
})
export class RubrosTerciarios implements OnInit, OnDestroy {
  periodos: Periodo[] = [];
  rubrosPrincipales: RubroPrincipal[] = [];
  rubrosSecundarios: RubroSecundario[] = [];
  rubrosTerciarios: RubroTerciario[] = [];
  
  periodoSeleccionado: number | null = null;
  secundarioSeleccionado: number | null = null;
  
  mostrarModalPeriodo = false;
  mostrarModalRubro = false;
  modoEdicion = false;
  
  rubroSeleccionado: RubroTerciario | null = null;
  
  nuevoRubro = {
    nombre: '',
    cuenta: '',
    codigoNumero: ''
  };
  
  procesando = false;
  cargando = false;
  cargandoPeriodos = true;
  cargandoSecundarios = false;

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
        this.periodos = periodos;
        this.cargandoPeriodos = false;
        
        if (periodos.length > 0 && !this.periodoSeleccionado) {
          // Backend no devuelve campo "activo", seleccionar el primero
          this.periodoSeleccionado = periodos[0].id;
          this.cargarPrincipales();
        }
      },
      error: (error) => {
        console.error('Error al cargar períodos:', error);
        this.toast.error('Error', 'No se pudieron cargar los períodos fiscales');
        this.cargandoPeriodos = false;
      }
    });
  }

  seleccionarPeriodo(periodoId: number): void {
    this.periodoSeleccionado = periodoId;
    this.mostrarModalPeriodo = false;
    this.cargarPrincipales();
  }

  cargarPrincipales(): void {
    if (!this.periodoSeleccionado) return;
    
    this.rubrosService.getRubrosPrincipalesByPeriodo(this.periodoSeleccionado).subscribe({
      next: (todosLosPrincipales) => {
        this.rubrosPrincipales = todosLosPrincipales.filter(p => p.periodo_fiscal_id === this.periodoSeleccionado);
        this.cargarTodosSecundarios();
      },
      error: (error) => {
        console.error('Error al cargar principales:', error);
      }
    });
  }

  cargarTodosSecundarios(): void {
    this.cargandoSecundarios = true;
    
    // Obtener TODOS los secundarios una sola vez
    this.rubrosService.getRubrosSecundariosByPrincipal(1).subscribe({
      next: (todosLosSecundarios) => {
        // Filtrar por período y remover duplicados por ID
        const secundariosFiltrados = todosLosSecundarios.filter(s => 
          s.periodo_fiscal_id === this.periodoSeleccionado
        );
        
        // Remover duplicados usando Map
        const secundariosUnicos = Array.from(
          new Map(secundariosFiltrados.map(s => [s.id, s])).values()
        );
        
        this.rubrosSecundarios = secundariosUnicos;
        this.cargandoSecundarios = false;
        
        console.log('✅ Secundarios únicos cargados:', this.rubrosSecundarios.length);
        
        if (this.rubrosSecundarios.length > 0 && !this.secundarioSeleccionado) {
          this.secundarioSeleccionado = this.rubrosSecundarios[0].id!;
          this.cargarTerciarios();
        }
      },
      error: (error) => {
        console.error('Error al cargar secundarios:', error);
        this.cargandoSecundarios = false;
      }
    });
  }

  onChangeSecundario(): void {
    if (this.secundarioSeleccionado) {
      this.cargarTerciarios();
    } else {
      this.rubrosTerciarios = [];
      this.totalTerciarios = 0;
    }
  }

  cargarTerciarios(): void {
    if (!this.secundarioSeleccionado) return;
    
    this.cargando = true;
    this.rubrosService.getRubrosTerciariosBySecundario(this.secundarioSeleccionado).subscribe({
      next: (todosLosTerciarios) => {
        this.rubrosTerciarios = todosLosTerciarios.filter(t => t.rublo_secundario_id === this.secundarioSeleccionado);
        this.totalTerciarios = this.rubrosTerciarios.length;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar terciarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros terciarios');
        this.cargando = false;
      }
    });
  }

  abrirModalNuevoRubro(): void {
    if (!this.periodoSeleccionado) {
      this.toast.warning('Período requerido', 'Por favor selecciona un período fiscal');
      this.mostrarModalPeriodo = true;
      return;
    }

    if (!this.secundarioSeleccionado) {
      this.toast.warning('Secundario requerido', 'Por favor selecciona un rubro secundario');
      return;
    }
    
    this.limpiarModalesHuerfanos();
    this.modoEdicion = false;
    this.nuevoRubro = { nombre: '', cuenta: '', codigoNumero: '' };
    this.mostrarModalRubro = true;
  }

  abrirModalEditarRubro(rubro: RubroTerciario): void {
    this.modoEdicion = true;
    this.rubroSeleccionado = rubro;
    
    const secundario = this.rubrosSecundarios.find(s => s.id === rubro.rublo_secundario_id);
    const codigoNumero = rubro.cuenta ? rubro.cuenta.replace(`${secundario?.cuenta}-`, '') : '';
    
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

    if (!this.secundarioSeleccionado) {
      this.toast.error('Error', 'No hay rubro secundario seleccionado');
      return;
    }

    const secundario = this.rubrosSecundarios.find(s => s.id === this.secundarioSeleccionado);
    if (!secundario) {
      this.toast.error('Error', 'No se encontró el rubro secundario');
      return;
    }

    const codigoCompleto = `${secundario.cuenta}-${this.nuevoRubro.codigoNumero.padStart(3, '0')}`;

    // Validar código duplicado
    if (!this.modoEdicion) {
      const codigoExistente = this.rubrosTerciarios.find(r => r.cuenta === codigoCompleto);
      if (codigoExistente) {
        this.toast.error('Código duplicado', `El código ${codigoCompleto} ya está siendo usado por "${codigoExistente.nombre}"`);
        return;
      }
    } else if (this.rubroSeleccionado) {
      const codigoExistente = this.rubrosTerciarios.find(r => r.cuenta === codigoCompleto && r.id !== this.rubroSeleccionado?.id);
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
      
      this.rubrosService.updateRubroTerciario(this.rubroSeleccionado.id, updateData).subscribe({
        next: () => {
          this.cargarTerciarios();
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
      const data: RubroTerciario = {
        nombre: this.nuevoRubro.nombre.trim(),
        cuenta: codigoCompleto,
        rublo_secundario_id: this.secundarioSeleccionado,
        periodo_fiscal_id: this.periodoSeleccionado
      };

      this.rubrosService.createRubroTerciario(data).subscribe({
        next: () => {
          this.cargarTerciarios();
          this.toast.success('¡Creado!', 'El rubro ha sido creado exitosamente');
          this.procesando = false;
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear rubro:', error);
          if (error.error && error.error.message) {
            this.toast.error('Error', error.error.message);
          } else {
            this.toast.error('Error', 'No se pudo crear el rubro');
          }
          this.procesando = false;
        }
      });
    }
  }

  async eliminarRubro(rubro: RubroTerciario): Promise<void> {
    if (!rubro.id) return;

    const confirmar = await this.mostrarConfirmacion(
      '¿Estás seguro?',
      `¿Deseas eliminar "${rubro.nombre}"? Esta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.procesando = true;
      this.rubrosService.deleteRubroTerciario(rubro.id).subscribe({
        next: () => {
          this.cargarTerciarios();
          this.limpiarModalesHuerfanos();
          this.toast.success('¡Eliminado!', 'El rubro ha sido eliminado');
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
    if (!periodo) return 'No encontrado';
    return `${periodo.anio}`;
  }

  getSecundarioNombre(): string {
    if (!this.secundarioSeleccionado) return 'Ninguno';
    const secundario = this.rubrosSecundarios.find(s => s.id === this.secundarioSeleccionado);
    return secundario ? secundario.nombre : 'Desconocido';
  }

  getSecundarioCodigo(): string {
    if (!this.secundarioSeleccionado) return 'RUB-000-00';
    const secundario = this.rubrosSecundarios.find(s => s.id === this.secundarioSeleccionado);
    return secundario?.cuenta || 'RUB-000-00';
  }

  getCodigoPreview(): string {
    if (!this.nuevoRubro.codigoNumero) return `${this.getSecundarioCodigo()}-000`;
    return `${this.getSecundarioCodigo()}-${this.nuevoRubro.codigoNumero.padStart(3, '0')}`;
  }

  private async mostrarConfirmacion(title: string, text: string): Promise<boolean> {
    return new Promise((resolve) => {
      const dialogId = `confirm-dialog-${Date.now()}`;
      const confirmHTML = `
        <div class="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in" style="background-color: rgba(0, 0, 0, 0.5);" id="${dialogId}">
          <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-orange-100">
                <svg class="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${title}</h3>
              <p class="text-gray-600 mb-6">${text}</p>
              <div class="flex gap-3 justify-center">
                <button id="btn-cancelar-${dialogId}" class="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300">Cancelar</button>
                <button id="btn-confirmar-${dialogId}" class="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', confirmHTML);
      const dialog = document.getElementById(dialogId);
      const btnConfirmar = document.getElementById(`btn-confirmar-${dialogId}`);
      const btnCancelar = document.getElementById(`btn-cancelar-${dialogId}`);
      const cleanup = () => { if (dialog) dialog.remove(); setTimeout(() => this.limpiarModalesHuerfanos(), 100); };
      btnConfirmar?.addEventListener('click', () => { cleanup(); resolve(true); }, { once: true });
      btnCancelar?.addEventListener('click', () => { cleanup(); resolve(false); }, { once: true });
      dialog?.addEventListener('click', (e) => { if (e.target === dialog) { cleanup(); resolve(false); }}, { once: true });
    });
  }
}
