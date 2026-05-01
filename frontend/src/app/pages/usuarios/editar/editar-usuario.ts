import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  UsuarioService, UsuarioPublico, ModificarUsuario
} from '../../../services/usuario.service';

@Component({
  selector: 'app-editar-usuario',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuarioComponent implements OnInit {

  usuario: UsuarioPublico | null = null;
  cambios: ModificarUsuario = {};
  error = '';
  exito = '';
  usuarioId: number = 0;

  constructor(
    private svc: UsuarioService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.usuarioId = params['id'];
      this.cargarUsuario();
    });
  }

  cargarUsuario(): void {
    this.svc.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuario = usuarios.find(u => u.id === this.usuarioId) || null;
        if (this.usuario) {
          this.cambios = { nombre: this.usuario.nombre, email: this.usuario.email };
        } else {
          this.error = 'Usuario no encontrado';
        }
      },
      error: () => this.error = 'Error al cargar el usuario',
    });
  }

  guardarEdicion(): void {
    if (!this.usuario) return;
    this.error = '';
    this.exito = '';
    this.svc.modificarUsuario(this.usuario.id, this.cambios).subscribe({
      next: () => {
        this.exito = 'Usuario modificado exitosamente';
        this.usuario = null;
      },
      error: () => this.error = 'Error al modificar usuario',
    });
  }
}
