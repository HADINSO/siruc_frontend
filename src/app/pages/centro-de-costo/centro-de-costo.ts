import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentrosCostoService, CentroCosto, Dependencia } from '../../services/centros-costo.service';
import { ToastService } from '../../services/toast.service';

interface CentroCostoExtended extends CentroCosto {
  cantidadDependencias: number;
  expandido: boolean;
}

@Component({
  selector: 'app-centro-de-costo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centro-de-costo.html',
  styleUrl: './centro-de-costo.css',
})
export class CentrosCost implements OnInit, OnDestroy {
  centros: CentroCostoExtended[] = [];
  
  mostrarModal = false;
  mostrarModalDependencia = false;
  modoEdicion = false;
  modoEdicionDependencia = false;
  
  centroSeleccionado: CentroCostoExtended | null = null;
  dependenciaSeleccionada: Dependencia | null = null;
  
  nuevoCentro = {
    nombre: ''
  };
  
  nuevaDependencia = {
    nombre: '',
    descripcion: ''
  };
  
  procesando = false;
  cargando = true;

  constructor(
    private centrosCostoService: CentrosCostoService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    // Limpiar cualquier modal que quede en el DOM
    this.limpiarModalesHuerfanos();
  }

  private limpiarModalesHuerfanos(): void {
    // Buscar y eliminar todos los modales de confirmación
    const modales = document.querySelectorAll('[id^="confirm-dialog-"]');
    modales.forEach(modal => modal.remove());
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Cargar centros y dependencias en paralelo
    Promise.all([
      this.centrosCostoService.getAllCentros().toPromise(),
      this.centrosCostoService.getAllDependencias().toPromise()
    ]).then(([centros, todasDependencias]) => {
      console.log('✅ Centros recibidos:', centros);
      console.log('✅ Todas las dependencias recibidas:', todasDependencias);
      
      // Asignar dependencias a cada centro
      this.centros = (centros || []).map(centro => {
        const dependenciasCentro = (todasDependencias || []).filter(dep => 
          Number(dep.centro_costo_id) === Number(centro.id)
        );
        
        console.log(`Centro ${centro.nombre} (ID: ${centro.id}) tiene ${dependenciasCentro.length} dependencias`);
        
        return {
          ...centro,
          dependencias: dependenciasCentro,
          cantidadDependencias: dependenciasCentro.length,
          expandido: false
        };
      });
      
      console.log('✅ Centros con dependencias asignadas:', this.centros);
      this.cargando = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('❌ Error al cargar datos:', error);
      this.toast.error('Error', 'No se pudieron cargar los centros de costo');
      this.cargando = false;
      this.cdr.detectChanges();
    });
  }

  get totalCentros(): number {
    return this.centros.length;
  }

  get totalDependencias(): number {
    return this.centros.reduce((total, centro) => total + centro.cantidadDependencias, 0);
  }

  toggleExpandir(centro: CentroCostoExtended): void {
    centro.expandido = !centro.expandido;
    // Las dependencias ya están cargadas desde cargarDatos()
    console.log(`Centro ${centro.nombre} expandido:`, centro.expandido);
    console.log(`Dependencias del centro:`, centro.dependencias);
  }

  cargarDependencias(centro: CentroCostoExtended): void {
    console.log('🔍 Cargando dependencias para centro:', centro.id);
    
    // ✅ CORREGIDO: Usar getAllDependencias y filtrar localmente
    this.centrosCostoService.getAllDependencias().subscribe({
      next: (todasDependencias) => {
        console.log('📦 Todas las dependencias recibidas:', todasDependencias);
        
        // Filtrar por centro_costo_id
        const dependenciasFiltradas = todasDependencias.filter(dep => 
          Number(dep.centro_costo_id) === Number(centro.id)
        );
        
        console.log(`✅ Dependencias filtradas para centro ${centro.id}:`, dependenciasFiltradas);
        
        centro.dependencias = dependenciasFiltradas;
        centro.cantidadDependencias = dependenciasFiltradas.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar dependencias:', error);
        centro.dependencias = [];
        centro.cantidadDependencias = 0;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNuevoCentro(): void {
    // Limpiar modales huérfanos antes de abrir uno nuevo
    this.limpiarModalesHuerfanos();
    
    this.modoEdicion = false;
    this.nuevoCentro = { nombre: '' };
    this.mostrarModal = true;
  }

  abrirModalEditarCentro(centro: CentroCostoExtended): void {
    this.modoEdicion = true;
    this.centroSeleccionado = centro;
    this.nuevoCentro = { nombre: centro.nombre };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevoCentro = { nombre: '' };
    this.centroSeleccionado = null;
    this.modoEdicion = false;
  }

  guardarCentro(): void {
    if (!this.nuevoCentro.nombre.trim()) {
      this.toast.warning('Campo requerido', 'El nombre del centro de costo es requerido');
      return;
    }

    this.procesando = true;

    if (this.modoEdicion && this.centroSeleccionado) {
      // Actualizar
      this.centrosCostoService.updateCentro(this.centroSeleccionado.id, this.nuevoCentro).subscribe({
        next: (centroActualizado) => {
          const index = this.centros.findIndex(c => c.id === centroActualizado.id);
          if (index !== -1) {
            this.centros[index] = {
              ...centroActualizado,
              dependencias: this.centros[index].dependencias,
              cantidadDependencias: this.centros[index].cantidadDependencias,
              expandido: this.centros[index].expandido
            };
          }
          this.cdr.detectChanges();
          this.toast.success('¡Actualizado!', 'El centro de costo ha sido actualizado exitosamente');
          this.procesando = false;
          this.cerrarModal();
        },
        error: (error) => {
          console.error('❌ Error al actualizar centro:', error);
          this.toast.error('Error', 'No se pudo actualizar el centro de costo');
          this.procesando = false;
        }
      });
    } else {
      // Crear
      this.centrosCostoService.createCentro(this.nuevoCentro).subscribe({
        next: (nuevoCentro) => {
          this.centros.push({
            ...nuevoCentro,
            dependencias: [],
            cantidadDependencias: 0,
            expandido: false
          });
          this.cdr.detectChanges();
          this.toast.success('¡Creado!', 'El centro de costo ha sido creado exitosamente');
          this.procesando = false;
          this.cerrarModal();
        },
        error: (error) => {
          console.error('❌ Error al crear centro:', error);
          this.toast.error('Error', 'No se pudo crear el centro de costo');
          this.procesando = false;
        }
      });
    }
  }

  async eliminarCentro(centro: CentroCostoExtended): Promise<void> {
    const confirmar = await this.mostrarConfirmacion(
      '¿Estás seguro?',
      `Al eliminar "${centro.nombre}" se eliminarán también todas sus ${centro.cantidadDependencias} dependencia(s). Esta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.procesando = true;
      this.centrosCostoService.deleteCentro(centro.id).subscribe({
        next: () => {
          const index = this.centros.findIndex(c => c.id === centro.id);
          if (index !== -1) {
            this.centros.splice(index, 1);
          }
          
          // Limpiar modales huérfanos después de eliminar
          this.limpiarModalesHuerfanos();
          
          this.cdr.detectChanges();
          this.toast.success('¡Eliminado!', 'El centro de costo y sus dependencias han sido eliminados');
          this.procesando = false;
        },
        error: (error) => {
          console.error('❌ Error al eliminar centro:', error);
          this.toast.error('Error', 'No se pudo eliminar el centro de costo');
          this.procesando = false;
        }
      });
    } else {
      // Si cancela, también limpiar
      this.limpiarModalesHuerfanos();
    }
  }

  abrirModalNuevaDependencia(centro: CentroCostoExtended): void {
    this.modoEdicionDependencia = false;
    this.centroSeleccionado = centro;
    this.nuevaDependencia = { nombre: '', descripcion: '' };
    this.mostrarModalDependencia = true;
  }

  abrirModalEditarDependencia(centro: CentroCostoExtended, dependencia: Dependencia): void {
    this.modoEdicionDependencia = true;
    this.centroSeleccionado = centro;
    this.dependenciaSeleccionada = dependencia;
    this.nuevaDependencia = { 
      nombre: dependencia.nombre, 
      descripcion: dependencia.descripcion 
    };
    this.mostrarModalDependencia = true;
  }

  cerrarModalDependencia(): void {
    this.mostrarModalDependencia = false;
    this.nuevaDependencia = { nombre: '', descripcion: '' };
    this.centroSeleccionado = null;
    this.dependenciaSeleccionada = null;
    this.modoEdicionDependencia = false;
  }

  guardarDependencia(): void {
    if (!this.nuevaDependencia.nombre.trim()) {
      this.toast.warning('Campo requerido', 'El nombre de la dependencia es requerido');
      return;
    }

    if (!this.centroSeleccionado) return;

    this.procesando = true;

    if (this.modoEdicionDependencia && this.dependenciaSeleccionada) {
      // Actualizar
      this.centrosCostoService.updateDependencia(
        this.dependenciaSeleccionada.id, 
        this.nuevaDependencia
      ).subscribe({
        next: (dependenciaActualizada) => {
          if (this.centroSeleccionado && this.centroSeleccionado.dependencias) {
            const index = this.centroSeleccionado.dependencias.findIndex(
              d => d.id === dependenciaActualizada.id
            );
            if (index !== -1) {
              this.centroSeleccionado.dependencias[index] = dependenciaActualizada;
            }
          }
          this.cdr.detectChanges();
          this.toast.success('¡Actualizado!', 'La dependencia ha sido actualizada exitosamente');
          this.procesando = false;
          this.cerrarModalDependencia();
        },
        error: (error) => {
          console.error('❌ Error al actualizar dependencia:', error);
          this.toast.error('Error', 'No se pudo actualizar la dependencia');
          this.procesando = false;
        }
      });
    } else {
      // Crear
      const nuevaDep = {
        centro_costo_id: this.centroSeleccionado.id,
        nombre: this.nuevaDependencia.nombre,
        descripcion: this.nuevaDependencia.descripcion
      };

      console.log('📤 Creando dependencia:', nuevaDep);

      this.centrosCostoService.createDependencia(nuevaDep).subscribe({
        next: (dependenciaCreada) => {
          console.log('✅ Dependencia creada:', dependenciaCreada);
          
          if (this.centroSeleccionado) {
            if (!this.centroSeleccionado.dependencias) {
              this.centroSeleccionado.dependencias = [];
            }
            this.centroSeleccionado.dependencias.push(dependenciaCreada);
            this.centroSeleccionado.cantidadDependencias = this.centroSeleccionado.dependencias.length;
          }
          this.cdr.detectChanges();
          this.toast.success('¡Creado!', 'La dependencia ha sido creada exitosamente');
          this.procesando = false;
          this.cerrarModalDependencia();
        },
        error: (error) => {
          console.error('❌ Error al crear dependencia:', error);
          console.error('Detalles del error:', error.error);
          this.toast.error('Error', 'No se pudo crear la dependencia');
          this.procesando = false;
        }
      });
    }
  }

  async eliminarDependencia(centro: CentroCostoExtended, dependencia: Dependencia): Promise<void> {
    const confirmar = await this.mostrarConfirmacion(
      '¿Eliminar dependencia?',
      `¿Estás seguro de eliminar "${dependencia.nombre}"? Esta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.procesando = true;
      this.centrosCostoService.deleteDependencia(dependencia.id).subscribe({
        next: () => {
          if (centro.dependencias) {
            const index = centro.dependencias.findIndex(d => d.id === dependencia.id);
            if (index !== -1) {
              centro.dependencias.splice(index, 1);
              centro.cantidadDependencias = centro.dependencias.length;
            }
          }
          
          // Limpiar modales después de eliminar
          this.limpiarModalesHuerfanos();
          
          this.cdr.detectChanges();
          this.toast.success('¡Eliminado!', 'La dependencia ha sido eliminada');
          this.procesando = false;
        },
        error: (error) => {
          console.error('❌ Error al eliminar dependencia:', error);
          this.toast.error('Error', 'No se pudo eliminar la dependencia');
          this.procesando = false;
        }
      });
    } else {
      // Si cancela, también limpiar
      this.limpiarModalesHuerfanos();
    }
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
        if (dialog) {
          dialog.remove();
        }
        // Verificar si quedan modales huérfanos y eliminarlos
        setTimeout(() => {
          this.limpiarModalesHuerfanos();
        }, 100);
      };
      
      const handleConfirmar = () => {
        cleanup();
        resolve(true);
      };
      
      const handleCancelar = () => {
        cleanup();
        resolve(false);
      };
      
      btnConfirmar?.addEventListener('click', handleConfirmar, { once: true });
      btnCancelar?.addEventListener('click', handleCancelar, { once: true });
      
      dialog?.addEventListener('click', (e) => {
        if (e.target === dialog) {
          handleCancelar();
        }
      }, { once: true });
    });
  }
}
