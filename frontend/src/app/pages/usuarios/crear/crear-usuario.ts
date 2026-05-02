import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  UsuarioService,
  CrearUsuario,
} from '../../../services/usuario.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css',
})
export class CrearUsuarioComponent {

  nuevoUsuario: CrearUsuario = {
    nombre: '',
    email: null,
    contrasena: '',
  };

  error = '';
  exito = '';
  cargando = false;

  constructor(private svc: UsuarioService, private router: Router) {}

  crear(): void {
    if (!this.nuevoUsuario.nombre.trim() || !this.nuevoUsuario.contrasena.trim()) {
      this.error = 'Nombre y contraseña son obligatorios';
      return;
    }

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.svc.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.exito = 'Usuario creado exitosamente';
        this.cargando = false;
        this.nuevoUsuario = { nombre: '', email: null, contrasena: '' };
      },
      error: () => {
        this.error = 'Error al crear usuario';
        this.cargando = false;
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/usuarios/listar']);
  }
}