import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService, CrearProducto } from '../../../services/producto.service';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css',
})
export class CrearProductoComponent {

  nuevoProducto: CrearProducto = { nombre: '', precio: 0, url_de_imagen: null };
  error = '';
  exito = '';
  cargando = false;

  constructor(private svc: ProductoService, private router: Router, private cdr: ChangeDetectorRef) {}

  crear(): void {
    if (!this.nuevoProducto.nombre.trim() || this.nuevoProducto.precio <= 0) {
      this.error = 'Nombre y precio son obligatorios';
      return;
    }

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.svc.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.exito = 'Producto creado exitosamente';
        this.cargando = false;
        this.nuevoProducto = { nombre: '', precio: 0, url_de_imagen: null };
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al crear producto';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/productos/listar']);
  }
}