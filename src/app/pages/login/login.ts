import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  usuario: string = '';
  contrasena: string = '';

  constructor(private authService: Auth) {}

  onLogin() {
    this.authService.login(this.usuario, this.contrasena).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
      },
      error: (error) => {
        console.error('Error en login:', error);
      }
    });
  }
}