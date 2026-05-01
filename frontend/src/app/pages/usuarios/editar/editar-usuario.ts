import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UsuarioService,
  UsuarioPublico,
  ModificarUsuario,
} from '../../../services/usuario.service';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuarioComponent implements OnInit {

  usuario: UsuarioPublico | null = null;
  cambios: ModificarUsuario = {};
  error = '';
  exito = '';
  cargando = false;
  usuarioId: number = 0;

  constructor(
    private svc: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      // Conversión correcta a number
      this.usuarioId = +params['id'];
      this.cargarUsuario();
    });
  }

  cargarUsuario(): void {
    this.error = '';
    // Usa buscarUsuarios([id]) porque no hay GET /usuario/{id} que devuelva UsuarioPublico
    this.svc.buscarUsuarios([this.usuarioId]).subscribe({
      next: (usuarios) => {
        if (usuarios.length === 0) {
          this.error = 'Usuario no encontrado';
          return;
        }
        this.usuario = usuarios[0];
        // Precarga el formulario con los datos actuales
        this.cambios = {
          nombre: this.usuario.nombre,
          email: this.usuario.email,
        };
      },
      error: () => (this.error = 'Error al cargar el usuario'),
    });
  }

  guardarEdicion(): void {
    if (!this.usuario) return;

    // Evita enviar si no hay nada completado
    const hayAlgo = Object.values(this.cambios).some(
      (v) => v !== null && v !== undefined && v !== ''
    );
    if (!hayAlgo) {
      this.error = 'Ingresa al menos un campo para modificar';
      return;
    }

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.svc.modificarUsuario(this.usuario.id, this.cambios).subscribe({
      next: (usuarioActualizado) => {
        this.exito = 'Usuario modificado exitosamente';
        this.usuario = usuarioActualizado;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al modificar usuario';
        this.cargando = false;
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/usuarios/listar']);
  }
}