import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RubrosService, RubroQuinario, RubroCuaternario, Periodo } from '../../services/rubros.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-rubros-quinarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubros-quinarios.html',
  styleUrls: ['./rubros-quinarios.css']
})
export class RubrosQuinariosComponent implements OnInit {
  // Datos
  rubros: RubroQuinario[] = [];
  rubrosCuaternarios: RubroCuaternario[] = [];
  periodos: Periodo[] = [];

  // Formulario
  rubroForm: RubroQuinario = {
    nombre: '',
    cuenta: '',
    rublo_cuaternario_id: 0,
    periodo_fiscal_id: 0,
    codigo: ''
  };

  // Estados
  modoEdicion = false;
  rubroEditando: RubroQuinario | null = null;
  mostrarFormulario = false;
  cargando = false;
  guardando = false;

  // Filtros
  periodoSeleccionado: number | null = null;
  cuaternarioSeleccionado: number | null = null;
  busqueda = '';

  constructor(
    private rubrosService: RubrosService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.rubrosService.getPeriodos().subscribe({
      next: (periodos) => {
        this.periodos = periodos;
        if (periodos.length > 0) {
          this.periodoSeleccionado = periodos[0].id;
          this.rubroForm.periodo_fiscal_id = periodos[0].id;
          this.cargarRubrosCuaternarios();
        }
      },
      error: (error) => {
        console.error('Error al cargar periodos:', error);
        this.toast.error('Error', 'No se pudieron cargar los periodos');
      }
    });
  }

  cargarRubrosCuaternarios(): void {
    if (!this.periodoSeleccionado) return;

    this.cargando = true;
    this.rubrosService.getRubrosCuaternariosByTerciario(0).subscribe({
      next: (rubros) => {
        this.rubrosCuaternarios = rubros.filter(r => r.periodo_fiscal_id === this.periodoSeleccionado);
        if (this.rubrosCuaternarios.length > 0 && !this.cuaternarioSeleccionado) {
          this.cuaternarioSeleccionado = this.rubrosCuaternarios[0].id!;
          this.rubroForm.rublo_cuaternario_id = this.rubrosCuaternarios[0].id!;
          this.cargarRubros();
        } else if (this.cuaternarioSeleccionado) {
          this.cargarRubros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rubros cuaternarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros cuaternarios');
        this.cargando = false;
      }
    });
  }

  cargarRubros(): void {
    if (!this.cuaternarioSeleccionado) return;

    this.cargando = true;
    this.rubrosService.getRubrosQuinariosByCuaternario(this.cuaternarioSeleccionado).subscribe({
      next: (rubros) => {
        this.rubros = rubros.filter(r => r.periodo_fiscal_id === this.periodoSeleccionado);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rubros quinarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros quinarios');
        this.cargando = false;
      }
    });
  }

  onChangePeriodo(): void {
    this.rubroForm.periodo_fiscal_id = this.periodoSeleccionado!;
    this.cuaternarioSeleccionado = null;
    this.cargarRubrosCuaternarios();
  }

  onChangeCuaternario(): void {
    this.rubroForm.rublo_cuaternario_id = this.cuaternarioSeleccionado!;
    this.cargarRubros();
  }

  get rubrosFiltrados(): RubroQuinario[] {
    return this.rubros.filter(rubro =>
      rubro.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      rubro.cuenta.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      rubro.codigo?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  abrirFormularioNuevo(): void {
    if (!this.cuaternarioSeleccionado) {
      this.toast.warning('Selecciona un rubro', 'Debes seleccionar un rubro cuaternario primero');
      return;
    }

    this.modoEdicion = false;
    this.rubroEditando = null;
    this.rubroForm = {
      nombre: '',
      cuenta: '',
      rublo_cuaternario_id: this.cuaternarioSeleccionado,
      periodo_fiscal_id: this.periodoSeleccionado!,
      codigo: ''
    };
    this.mostrarFormulario = true;
  }

  editarRubro(rubro: RubroQuinario): void {
    this.modoEdicion = true;
    this.rubroEditando = rubro;
    this.rubroForm = { ...rubro };
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.rubroEditando = null;
    this.rubroForm = {
      nombre: '',
      cuenta: '',
      rublo_cuaternario_id: this.cuaternarioSeleccionado || 0,
      periodo_fiscal_id: this.periodoSeleccionado || 0,
      codigo: ''
    };
  }

  guardarRubro(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;

    if (this.modoEdicion && this.rubroEditando) {
      this.rubrosService.updateRubroQuinario(this.rubroEditando.id!, this.rubroForm).subscribe({
        next: () => {
          this.toast.success('Actualizado', 'Rubro quinario actualizado exitosamente');
          this.cargarRubros();
          this.cancelarFormulario();
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.toast.error('Error', 'No se pudo actualizar el rubro');
          this.guardando = false;
        }
      });
    } else {
      this.rubrosService.createRubroQuinario(this.rubroForm).subscribe({
        next: () => {
          this.toast.success('Creado', 'Rubro quinario creado exitosamente');
          this.cargarRubros();
          this.cancelarFormulario();
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.toast.error('Error', 'No se pudo crear el rubro');
          this.guardando = false;
        }
      });
    }
  }

  eliminarRubro(rubro: RubroQuinario): void {
    if (!confirm(`¿Estás seguro de eliminar el rubro "${rubro.nombre}"?`)) {
      return;
    }

    this.rubrosService.deleteRubroQuinario(rubro.id!).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Rubro quinario eliminado exitosamente');
        this.cargarRubros();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.toast.error('Error', 'No se pudo eliminar el rubro');
      }
    });
  }

  validarFormulario(): boolean {
    if (!this.rubroForm.nombre.trim()) {
      this.toast.warning('Campo requerido', 'El nombre es obligatorio');
      return false;
    }

    if (!this.rubroForm.cuenta.trim()) {
      this.toast.warning('Campo requerido', 'La cuenta es obligatoria');
      return false;
    }

    if (!this.rubroForm.rublo_cuaternario_id) {
      this.toast.warning('Campo requerido', 'Debes seleccionar un rubro cuaternario');
      return false;
    }

    if (!this.rubroForm.periodo_fiscal_id) {
      this.toast.warning('Campo requerido', 'Debes seleccionar un periodo');
      return false;
    }

    return true;
  }

  get rubroCuaternarioNombre(): string {
    const cuaternario = this.rubrosCuaternarios.find(r => r.id === this.cuaternarioSeleccionado);
    return cuaternario ? `${cuaternario.cuenta} - ${cuaternario.nombre}` : 'Selecciona un rubro cuaternario';
  }

  getRubroCuaternarioInfo(id: number): { cuenta: string; nombre: string } {
    const cuaternario = this.rubrosCuaternarios.find(r => r.id === id);
    return cuaternario ? { cuenta: cuaternario.cuenta, nombre: cuaternario.nombre } : { cuenta: '-', nombre: '-' };
  }
}
