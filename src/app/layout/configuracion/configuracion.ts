import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ConfiguracionUsuario {
  notificaciones: {
    correo: boolean;
    push: boolean;
    resumenSemanal: boolean;
  };
  seguridad: {
    ultimoCambioContrasena: string;
    autenticacionDosFactor: boolean;
    dispositivosConectados: number;
  };
  preferencias: {
    tema: 'claro' | 'oscuro';
    idioma: 'es' | 'en' | 'fr';
    zonaHoraria: string;
  };
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion implements OnInit {
  @Input() mostrar: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<ConfiguracionUsuario>();

  config: ConfiguracionUsuario = {
    notificaciones: {
      correo: true,
      push: true,
      resumenSemanal: false
    },
    seguridad: {
      ultimoCambioContrasena: 'Hace 3 meses',
      autenticacionDosFactor: true,
      dispositivosConectados: 3
    },
    preferencias: {
      tema: 'claro',
      idioma: 'es',
      zonaHoraria: 'America/Bogota'
    }
  };

  configEditada: ConfiguracionUsuario = { ...this.config };
  editando: boolean = false;

  // Opciones para selects
  idiomas = [
    { codigo: 'es', nombre: 'Español' },
    { codigo: 'en', nombre: 'English' },
    { codigo: 'fr', nombre: 'Français' }
  ];

  zonaHorarias = [
    { codigo: 'America/New_York', nombre: 'América/Nueva York (EST)' },
    { codigo: 'America/Chicago', nombre: 'América/Chicago (CST)' },
    { codigo: 'America/Denver', nombre: 'América/Denver (MST)' },
    { codigo: 'America/Los_Angeles', nombre: 'América/Los Ángeles (PST)' },
    { codigo: 'America/Bogota', nombre: 'América/Bogotá (COT)' },
    { codigo: 'America/Mexico_City', nombre: 'América/Ciudad de México (CST)' },
    { codigo: 'Europe/London', nombre: 'Europa/Londres (GMT)' },
    { codigo: 'Europe/Madrid', nombre: 'Europa/Madrid (CET)' },
    { codigo: 'Europe/Paris', nombre: 'Europa/París (CET)' },
    { codigo: 'Asia/Tokyo', nombre: 'Asia/Tokio (JST)' },
    { codigo: 'Asia/Shanghai', nombre: 'Asia/Shanghái (CST)' },
    { codigo: 'Asia/Hong_Kong', nombre: 'Asia/Hong Kong (HKT)' },
    { codigo: 'Australia/Sydney', nombre: 'Australia/Sydney (AEDT)' }
  ];

  ngOnInit(): void {
    this.configEditada = JSON.parse(JSON.stringify(this.config));
  }

  abrirEdicion(): void {
    this.editando = true;
    this.configEditada = JSON.parse(JSON.stringify(this.config));
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.configEditada = JSON.parse(JSON.stringify(this.config));
  }

  guardarCambios(): void {
    this.config = JSON.parse(JSON.stringify(this.configEditada));
    this.editando = false;
    this.guardar.emit(this.config);
    console.log('✅ Configuración actualizada:', this.config);
  }

  cerrarModal(): void {
    this.editando = false;
    this.cerrar.emit();
  }

  // Métodos para obtener etiquetas amigables
  getNombreTema(tema: string): string {
    return tema === 'claro' ? '☀️ Claro' : '🌙 Oscuro';
  }

  getNombreIdioma(codigo: string): string {
    const idioma = this.idiomas.find(i => i.codigo === codigo);
    return idioma ? idioma.nombre : 'Desconocido';
  }

  getNombreZonaHoraria(codigo: string): string {
    const zona = this.zonaHorarias.find(z => z.codigo === codigo);
    return zona ? zona.nombre : 'Desconocida';
  }

  cambiarTema(tema: 'claro' | 'oscuro'): void {
    this.configEditada.preferencias.tema = tema;
  }

  // Métodos para toggle switches
  toggleNotificacion(tipo: 'correo' | 'push' | 'resumenSemanal'): void {
    this.configEditada.notificaciones[tipo] = !this.configEditada.notificaciones[tipo];
  }

  toggleAutenticacionDosFactor(): void {
    this.configEditada.seguridad.autenticacionDosFactor = !this.configEditada.seguridad.autenticacionDosFactor;
  }
}
