import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  UsuarioService, CrearUsuario
} from '../../../services/usuario.service';

@Component({
  selector: 'app-crear-usuario',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css',
})
export class CrearUsuarioComponent {

  nuevoUsuario: CrearUsuario = { nombre:'', contraseña:'' };
  error = '';
  exito = '';

  constructor(private svc: UsuarioService) {}

  crear(): void {
    this.error = '';
    this.exito = '';
    this.svc.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.exito = 'Usuario creado exitosamente';
        this.nuevoUsuario = { nombre:'', contraseña:'' };
      },
      error: () => this.error = 'Error al crear usuario',
    });
  }
}
