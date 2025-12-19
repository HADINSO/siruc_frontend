import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RubrosService, RubroCuaternario, RubroTerciario, Periodo } from '../../services/rubros.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-rubros-cuaternarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubros-cuaternarios.html',
  styleUrls: ['./rubros-cuaternarios.css']
})
export class RubrosCuaternariosComponent implements OnInit {
  // Datos
  rubros: RubroCuaternario[] = [];
  rubrosTerciarios: RubroTerciario[] = [];
  periodos: Periodo[] = [];

  // Formulario
  rubroForm: RubroCuaternario = {
    nombre: '',
    cuenta: '',
    rublo_terciario_id: 0,
    periodo_fiscal_id: 0,
    codigo: ''
  };

  // Estados
  modoEdicion = false;
  rubroEditando: RubroCuaternario | null = null;
  mostrarFormulario = false;
  cargando = false;
  guardando = false;

  // Filtros
  periodoSeleccionado: number | null = null;
  terciarioSeleccionado: number | null = null;
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
          this.cargarRubrosTerciarios();
        }
      },
      error: (error) => {
        console.error('Error al cargar periodos:', error);
        this.toast.error('Error', 'No se pudieron cargar los periodos');
      }
    });
  }

  cargarRubrosTerciarios(): void {
    if (!this.periodoSeleccionado) return;

    this.cargando = true;
    this.rubrosService.getRubrosTerciariosBySecundario(0).subscribe({
      next: (rubros) => {
        this.rubrosTerciarios = rubros.filter(r => r.periodo_fiscal_id === this.periodoSeleccionado);
        if (this.rubrosTerciarios.length > 0 && !this.terciarioSeleccionado) {
          this.terciarioSeleccionado = this.rubrosTerciarios[0].id!;
          this.rubroForm.rublo_terciario_id = this.rubrosTerciarios[0].id!;
          this.cargarRubros();
        } else if (this.terciarioSeleccionado) {
          this.cargarRubros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rubros terciarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros terciarios');
        this.cargando = false;
      }
    });
  }

  cargarRubros(): void {
    if (!this.terciarioSeleccionado) return;

    this.cargando = true;
    this.rubrosService.getRubrosCuaternariosByTerciario(this.terciarioSeleccionado).subscribe({
      next: (rubros) => {
        this.rubros = rubros.filter(r => r.periodo_fiscal_id === this.periodoSeleccionado);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rubros cuaternarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros cuaternarios');
        this.cargando = false;
      }
    });
  }

  onChangePeriodo(): void {
    this.rubroForm.periodo_fiscal_id = this.periodoSeleccionado!;
    this.terciarioSeleccionado = null;
    this.cargarRubrosTerciarios();
  }

  onChangeTerciario(): void {
    this.rubroForm.rublo_terciario_id = this.terciarioSeleccionado!;
    this.cargarRubros();
  }

  get rubrosFiltrados(): RubroCuaternario[] {
    return this.rubros.filter(rubro =>
      rubro.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      rubro.cuenta.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      rubro.codigo?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  abrirFormularioNuevo(): void {
    if (!this.terciarioSeleccionado) {
      this.toast.warning('Selecciona un rubro', 'Debes seleccionar un rubro terciario primero');
      return;
    }

    this.modoEdicion = false;
    this.rubroEditando = null;
    this.rubroForm = {
      nombre: '',
      cuenta: '',
      rublo_terciario_id: this.terciarioSeleccionado,
      periodo_fiscal_id: this.periodoSeleccionado!,
      codigo: ''
    };
    this.mostrarFormulario = true;
  }

  editarRubro(rubro: RubroCuaternario): void {
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
      rublo_terciario_id: this.terciarioSeleccionado || 0,
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
      this.rubrosService.updateRubroCuaternario(this.rubroEditando.id!, this.rubroForm).subscribe({
        next: () => {
          this.toast.success('Actualizado', 'Rubro cuaternario actualizado exitosamente');
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
      this.rubrosService.createRubroCuaternario(this.rubroForm).subscribe({
        next: () => {
          this.toast.success('Creado', 'Rubro cuaternario creado exitosamente');
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

  eliminarRubro(rubro: RubroCuaternario): void {
    if (!confirm(`¿Estás seguro de eliminar el rubro "${rubro.nombre}"?`)) {
      return;
    }

    this.rubrosService.deleteRubroCuaternario(rubro.id!).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Rubro cuaternario eliminado exitosamente');
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

    if (!this.rubroForm.rublo_terciario_id) {
      this.toast.warning('Campo requerido', 'Debes seleccionar un rubro terciario');
      return false;
    }

    if (!this.rubroForm.periodo_fiscal_id) {
      this.toast.warning('Campo requerido', 'Debes seleccionar un periodo');
      return false;
    }

    return true;
  }

  get rubroTerciarioNombre(): string {
    const terciario = this.rubrosTerciarios.find(r => r.id === this.terciarioSeleccionado);
    return terciario ? `${terciario.cuenta} - ${terciario.nombre}` : 'Selecciona un rubro terciario';
  }

  getRubroTerciarioInfo(id: number): { cuenta: string; nombre: string } {
    const terciario = this.rubrosTerciarios.find(r => r.id === id);
    return terciario ? { cuenta: terciario.cuenta, nombre: terciario.nombre } : { cuenta: '-', nombre: '-' };
  }
}
