import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario, UsuarioUtil } from '../../../../models/usuario.model';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css'
})
export class UserModalComponent implements OnChanges {
  @Input() mostrar: boolean = false;
  @Input() usuarioEditar: Usuario | null = null;
  @Input() roles: any[] = [];
  @Input() permisos: any[] = [];
  @Input() elementos: any[] = [];
  
  @Output() guardar = new EventEmitter<Omit<Usuario, 'id'>>();
  @Output() cancelar = new EventEmitter<void>();

  formulario!: FormGroup;
  esEdicion = false;
  cargando = false;
  mostrarErrores = false;
  mostrarPassword = false;

  constructor(private formBuilder: FormBuilder) {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && this.mostrar) {
      if (this.usuarioEditar) {
        this.esEdicion = true;
        this.llenarFormularioEdicion();
      } else {
        this.esEdicion = false;
        this.limpiarFormulario();
      }
      this.mostrarErrores = false;
      this.mostrarPassword = false;
    }
  }

  /**
   * Inicializa el formulario reactivo
   */
  private inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      username: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol_id: ['', Validators.required],
      permisos: [[], Validators.required],
      elementos: [[], Validators.required]
    });
  }

  /**
   * Llena el formulario con datos del usuario a editar
   */
  private llenarFormularioEdicion(): void {
    if (this.usuarioEditar) {
      this.formulario.patchValue({
        nombre: this.usuarioEditar.nombre,
        apellido: this.usuarioEditar.apellido,
        correo: this.usuarioEditar.correo,
        username: this.usuarioEditar.username,
        rol_id: this.usuarioEditar.rol_id,
        permisos: this.usuarioEditar.permisos || [],
        elementos: this.usuarioEditar.elementos || []
      });
      
      // Password es opcional en edición
      this.formulario.get('password')?.clearAsyncValidators();
      this.formulario.get('password')?.setValidators([]);
      this.formulario.get('password')?.updateValueAndValidity();
    }
  }

  /**
   * Limpia el formulario
   */
  private limpiarFormulario(): void {
    this.formulario.reset({
      nombre: '',
      apellido: '',
      correo: '',
      username: '',
      password: '',
      rol_id: '',
      permisos: [],
      elementos: []
    });
  }

  /**
   * Valida y envía el formulario
   */
  onGuardar(): void {
    this.mostrarErrores = true;

    if (this.formulario.invalid) {
      console.log('❌ Formulario inválido');
      return;
    }

    this.cargando = true;
    const datosUsuario = this.formulario.value;

    // Si es edición y no tiene password, eliminar password del objeto
    if (this.esEdicion && !datosUsuario.password) {
      delete datosUsuario.password;
    }

    // Asegurar que permisos y elementos son arrays de números
    datosUsuario.permisos = Array.isArray(datosUsuario.permisos) 
      ? datosUsuario.permisos.map((p: any) => typeof p === 'object' ? p.id : p)
      : [];
    
    datosUsuario.elementos = Array.isArray(datosUsuario.elementos)
      ? datosUsuario.elementos.map((e: any) => typeof e === 'object' ? e.id : e)
      : [];

    // Convertir rol_id a número
    datosUsuario.rol_id = Number(datosUsuario.rol_id);

    setTimeout(() => {
      console.log('✅ Guardando usuario:', datosUsuario);
      this.guardar.emit(datosUsuario);
      this.cargando = false;
    }, 500);
  }

  /**
   * Cancela la edición
   */
  onCancelar(): void {
    this.cancelar.emit();
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const control = this.formulario.get(fieldName);

    if (!control || !control.errors || !this.mostrarErrores) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (fieldName === 'nombre' || fieldName === 'apellido') {
      if (control.hasError('minlength')) {
        return 'Mínimo 2 caracteres';
      }
      if (control.hasError('maxlength')) {
        return 'Máximo 50 caracteres';
      }
    }

    if (fieldName === 'username') {
      if (control.hasError('minlength')) {
        return 'Mínimo 3 caracteres';
      }
      if (control.hasError('maxlength')) {
        return 'Máximo 30 caracteres';
      }
      if (control.hasError('pattern')) {
        return 'Solo letras, números y guiones bajos';
      }
    }

    if (fieldName === 'correo') {
      if (control.hasError('email')) {
        return 'Email inválido';
      }
    }

    if (fieldName === 'password') {
      if (control.hasError('minlength')) {
        return 'Mínimo 6 caracteres';
      }
    }

    return '';
  }

  /**
   * Verifica si un campo tiene error
   */
  tieneError(fieldName: string): boolean {
    const control = this.formulario.get(fieldName);
    return this.mostrarErrores && control ? control.invalid : false;
  }

  /**
   * Toggle para mostrar/ocultar password
   */
  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Obtiene los permisos seleccionados
   */
  getPermisosSeleccionados(): number[] {
    return this.formulario.get('permisos')?.value || [];
  }

  /**
   * Obtiene los elementos seleccionados
   */
  getElementosSeleccionados(): number[] {
    return this.formulario.get('elementos')?.value || [];
  }

  /**
   * Toggle de permiso
   */
  togglePermiso(permisoId: number): void {
    const control = this.formulario.get('permisos');
    const permisos = control?.value || [];
    const index = permisos.indexOf(permisoId);
    
    if (index > -1) {
      permisos.splice(index, 1);
    } else {
      permisos.push(permisoId);
    }
    
    control?.setValue([...permisos]);
  }

  /**
   * Toggle de elemento
   */
  toggleElemento(elementoId: number): void {
    const control = this.formulario.get('elementos');
    const elementos = control?.value || [];
    const index = elementos.indexOf(elementoId);
    
    if (index > -1) {
      elementos.splice(index, 1);
    } else {
      elementos.push(elementoId);
    }
    
    control?.setValue([...elementos]);
  }
}