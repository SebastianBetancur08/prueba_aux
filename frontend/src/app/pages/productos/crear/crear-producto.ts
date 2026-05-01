import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    ProductoService, CrearProducto
} from '../../../services/producto.service';

@Component({
  selector: 'app-crear-producto',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css',
})
export class CrearProductoComponent {

  nuevoProducto: CrearProducto = {nombre:'', precio: 0, url_de_imagen: ''};
  error = '';
  exito = '';

  constructor(private svc: ProductoService) {}

  crear(): void {
    this.error = '';
    this.exito = '';
    this.svc.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.exito = 'Producto creado exitosamente';
        this.nuevoProducto = {nombre:'', precio: 0, url_de_imagen: ''};
      },
      error: () => this.error = 'Error al crear producto',
    });
  }
}
