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
    // Limpiar errores previos
    this.mensajeError = '';
    this.mostrarError = false;

    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.mensajeError = 'Por favor completa todos los campos.';
      this.mostrarError = true;
      return;
    }

    this.loading = true;

    this.authService.login(this.usuario, this.contrasena).subscribe({
      next: () => {
        localStorage.setItem('usuario', this.usuario);
        this.loading = false;
        this.loginExitoso = true;
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 1000);
      },
      error: () => {
        this.loading = false;
        this.mensajeError = 'Tu contraseña no es correcta. Vuelve a comprobarla.';
        this.mostrarError = true;
      }
    });
  }
}