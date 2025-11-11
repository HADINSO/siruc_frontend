import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
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
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#0d7a30'
      });
      return;
    }

    this.loading = true;

    this.authService.login(this.usuario, this.contrasena).subscribe({
      next: () => {
        localStorage.setItem('usuario', this.usuario);
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso.',
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 1500);
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: 'Usuario o contraseña incorrectos.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
