import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  usuario: string = '';
  contrasena: string = '';
  mostrarContrasena: boolean = false;
  loading: boolean = false;
  mensajeError: string = '';
  mostrarError: boolean = false;
  loginExitoso: boolean = false;

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = usuarioGuardado;
    }
  }

  toggleContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  onLogin(): void {
    this.mensajeError = '';
    this.mostrarError = false;

    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.mensajeError = 'Por favor completa todos los campos.';
      this.mostrarError = true;
      return;
    }

    this.loading = true;

    this.authService.login(this.usuario, this.contrasena).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso, respuesta:', response);
        
        const personaId = localStorage.getItem('persona_id');
        const nombre = localStorage.getItem('nombre_usuario');
        const rol = localStorage.getItem('rol_usuario');
        
        console.log('📦 LocalStorage después del login:');
        console.log('- persona_id:', personaId);
        console.log('- nombre_usuario:', nombre);
        console.log('- rol_usuario:', rol);
        
        if (!personaId) {
          console.error('❌ ERROR: persona_id no se guardó en localStorage');
          console.log('Estructura de respuesta recibida:', JSON.stringify(response, null, 2));
        }
        
        this.loading = false;
        this.loginExitoso = true;
        
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.loading = false;
        this.mensajeError = 'Tu contraseña no es correcta. Vuelve a comprobarla.';
        this.mostrarError = true;
      }
    });
  }
}
