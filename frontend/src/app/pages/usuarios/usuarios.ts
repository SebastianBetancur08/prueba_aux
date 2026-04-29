import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  UsuarioService, UsuarioPublico, CrearUsuario, ModificarUsuario
} from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  
  usuarios: UsuarioPublico[] = [];
  error = '';
  
  // Formulario crear
  nuevoUsuario: CrearUsuario = { nombre:'', contraseña:'' };

  // Formulario editar
  editando: UsuarioPublico | null = null;
  cambios: ModificarUsuario = {};

  constructor(private svc: UsuarioService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.obtenerUsuarios().subscribe({
      next: data => this.usuarios = data,
      error: () => this.error = 'Error al cargar usuarios',
  });
}

  crear(): void {
    this.svc.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => { this.nuevoUsuario = { nombre:'', contraseña:'' };
      this.cargar(); },
      error: () => this.error = 'Error al crear usuario',
    });
  }
  
  iniciarEdicion(u: UsuarioPublico): void {
    this.editando = u;
    this.cambios = { nombre: u.nombre, email: u.email };
  }

  guardarEdicion(): void {
    if (!this.editando) return;
    this.svc.modificarUsuario(this.editando.id, this.cambios).subscribe({
      next: () => { this.editando = null; this.cargar(); },
      error: () => this.error = 'Error al modificar usuario',
    });
  }
  
  eliminar(id: number): void {
    this.svc.eliminarUsuario(id).subscribe({
      next: () => this.cargar(),
      error: () => this.error = 'Error al eliminar usuario',
    });
  }
}
  
