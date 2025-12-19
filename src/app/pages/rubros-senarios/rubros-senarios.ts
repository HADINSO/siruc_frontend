import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RubrosService, RubroSenario, RubroQuinario, Periodo } from '../../services/rubros.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-rubros-senarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubros-senarios.html',
  styleUrls: ['./rubros-senarios.css']
})
export class RubrosSenarioComponent implements OnInit {
  // Datos
  rubros: RubroSenario[] = [];
  rubrosQuinarios: RubroQuinario[] = [];
  periodos: Periodo[] = [];

  // Formulario
  rubroForm: RubroSenario = {
    nombre: '',
    cuenta: '',
    rublo_quinario_id: 0,
    periodo_fiscal_id: 0,
    codigo: ''
  };

  // Estados
  modoEdicion = false;
  rubroEditando: RubroSenario | null = null;
  mostrarFormulario = false;
  cargando = false;
  guardando = false;

  // Filtros
  periodoSeleccionado: number | null = null;
  quinarioSeleccionado: number | null = null;
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
          this.cargarRubrosQuinarios();
        }
      },
      error: (error) => {
        console.error('Error al cargar periodos:', error);
        this.toast.error('Error', 'No se pudieron cargar los periodos');
      }
    });
  }

  cargarRubrosQuinarios(): void {
    if (!this.periodoSeleccionado) return;

    this.cargando = true;
    this.rubrosService.getRubrosQuinariosByCuaternario(0).subscribe({
      next: (rubros) => {
        this.rubrosQuinarios = rubros.filter(r => r.periodo_fiscal_id === this.periodoSeleccionado);
        if (this.rubrosQuinarios.length > 0 && !this.quinarioSeleccionado) {
          this.quinarioSeleccionado = this.rubrosQuinarios[0].id!;
          this.rubroForm.rublo_quinario_id = this.rubrosQuinarios[0].id!;
          this.cargarRubros();
        } else if (this.quinarioSeleccionado) {
          this.cargarRubros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rubros quinarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros quinarios');
        this.cargando = false;
      }
    });
  }

  cargarRubros(): void {
    if (!this.quinarioSeleccionado) return;

    this.cargando = true;
    this.rubrosService.getRubrosSenariosByQuinario(this.quinarioSeleccionado).subscribe({
      next: (rubros) => {
        this.rubros = rubros.filter(r => r.periodo_fiscal_id === this.periodoSeleccionado);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rubros senarios:', error);
        this.toast.error('Error', 'No se pudieron cargar los rubros senarios');
        this.cargando = false;
      }
    });
  }

  onChangePeriodo(): void {
    this.rubroForm.periodo_fiscal_id = this.periodoSeleccionado!;
    this.quinarioSeleccionado = null;
    this.cargarRubrosQuinarios();
  }

  onChangeQuinario(): void {
    this.rubroForm.rublo_quinario_id = this.quinarioSeleccionado!;
    this.cargarRubros();
  }

  get rubrosFiltrados(): RubroSenario[] {
    return this.rubros.filter(rubro =>
      rubro.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      rubro.cuenta.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      rubro.codigo?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  abrirFormularioNuevo(): void {
    if (!this.quinarioSeleccionado) {
      this.toast.warning('Selecciona un rubro', 'Debes seleccionar un rubro quinario primero');
      return;
    }

    this.modoEdicion = false;
    this.rubroEditando = null;
    this.rubroForm = {
      nombre: '',
      cuenta: '',
      rublo_quinario_id: this.quinarioSeleccionado,
      periodo_fiscal_id: this.periodoSeleccionado!,
      codigo: ''
    };
    this.mostrarFormulario = true;
  }

  editarRubro(rubro: RubroSenario): void {
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
      rublo_quinario_id: this.quinarioSeleccionado || 0,
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
      this.rubrosService.updateRubroSenario(this.rubroEditando.id!, this.rubroForm).subscribe({
        next: () => {
          this.toast.success('Actualizado', 'Rubro senario actualizado exitosamente');
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
      this.rubrosService.createRubroSenario(this.rubroForm).subscribe({
        next: () => {
          this.toast.success('Creado', 'Rubro senario creado exitosamente');
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

  eliminarRubro(rubro: RubroSenario): void {
    if (!confirm(`¿Estás seguro de eliminar el rubro "${rubro.nombre}"?`)) {
      return;
    }

    this.rubrosService.deleteRubroSenario(rubro.id!).subscribe({
      next: () => {
        this.toast.success('Eliminado', 'Rubro senario eliminado exitosamente');
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

    if (!this.rubroForm.rublo_quinario_id) {
      this.toast.warning('Campo requerido', 'Debes seleccionar un rubro quinario');
      return false;
    }

    if (!this.rubroForm.periodo_fiscal_id) {
      this.toast.warning('Campo requerido', 'Debes seleccionar un periodo');
      return false;
    }

    return true;
  }

  get rubroQuinarioNombre(): string {
    const quinario = this.rubrosQuinarios.find(r => r.id === this.quinarioSeleccionado);
    return quinario ? `${quinario.cuenta} - ${quinario.nombre}` : 'Selecciona un rubro quinario';
  }

  getRubroQuinarioInfo(id: number): { cuenta: string; nombre: string } {
    const quinario = this.rubrosQuinarios.find(r => r.id === id);
    return quinario ? { cuenta: quinario.cuenta, nombre: quinario.nombre } : { cuenta: '-', nombre: '-' };
  }
}
