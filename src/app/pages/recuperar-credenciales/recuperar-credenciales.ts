import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-credenciales',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './recuperar-credenciales.html',
  styleUrl: './recuperar-credenciales.css'
})
export class RecuperarCredenciales {
  correo: string = '';
  tipoRecuperacion: string = 'usuario';
  
  // Estados de validación
  emailValido: boolean = true;
  usuarioNoEncontrado: boolean = false;
  mensajeError: string = '';
  intentoEnvio: boolean = false;
  
  // Estado del modal de éxito
  mostrarModalExito: boolean = false;
  mensajeExito: string = '';
  tipoRecuperacionEnviado: string = '';
  
  // ⭐ CORREO ESTÁTICO PERMITIDO ⭐
  // Aquí configuras el correo que funcionará
  correoPermitido: string = 'admin@utch.edu.co';
  
  // Propiedad para controlar si el botón está habilitado
  get botonHabilitado(): boolean {
    if (this.correo.trim().length === 0) {
      return false;
    }
    return true;
  }

  // Método para validar el formato del email
  validarFormatoEmail(email: string): boolean {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }

  // Método para verificar si el correo es el permitido
  esCorreoPermitido(email: string): boolean {
    return email.toLowerCase() === this.correoPermitido.toLowerCase();
  }

  // Método para enviar la solicitud
  enviarSolicitud(): void {
    this.intentoEnvio = true;
    
    // 1️⃣ Validar que el campo no esté vacío
    if (this.correo.trim().length === 0) {
      this.mensajeError = 'Por favor ingresa tu correo';
      this.emailValido = false;
      this.usuarioNoEncontrado = false;
      return;
    }

    // 2️⃣ Validar formato del email
    if (!this.validarFormatoEmail(this.correo)) {
      this.mensajeError = 'Por favor ingresa un email válido';
      this.emailValido = false;
      this.usuarioNoEncontrado = false;
      return;
    }

    // 3️⃣ Validar que sea el correo permitido
    if (!this.esCorreoPermitido(this.correo)) {
      this.mensajeError = 'Usuario no encontrado';
      this.emailValido = false;
      this.usuarioNoEncontrado = true;
      console.log('❌ Correo no permitido:', this.correo);
      return;
    }

    // 4️⃣ Si llegamos aquí, TODO ES VÁLIDO ✅
    this.emailValido = true;
    this.usuarioNoEncontrado = false;
    this.mensajeError = '';
    
    // Generar mensaje personalizado según el tipo de recuperación
    this.tipoRecuperacionEnviado = this.tipoRecuperacion;
    
    if (this.tipoRecuperacion === 'usuario') {
      this.mensajeExito = `Hemos enviado tu usuario a ${this.correo}. Por favor revisa tu correo electrónico.`;
    } else {
      this.mensajeExito = `Hemos enviado un enlace para resetear tu contraseña a ${this.correo}. Por favor revisa tu correo electrónico.`;
    }
    
    // Mostrar modal de éxito
    this.mostrarModalExito = true;
    
    console.log('📧 Solicitud válida enviada:');
    console.log('Correo:', this.correo);
    console.log('Tipo:', this.tipoRecuperacion);
  }

  // Método para cerrar el modal de éxito
  cerrarModalExito(): void {
    this.mostrarModalExito = false;
    this.limpiarFormulario();
  }

  // Método opcional: limpiar el formulario
  limpiarFormulario(): void {
    this.correo = '';
    this.tipoRecuperacion = 'usuario';
    this.emailValido = true;
    this.usuarioNoEncontrado = false;
    this.mensajeError = '';
    this.intentoEnvio = false;
  }
}