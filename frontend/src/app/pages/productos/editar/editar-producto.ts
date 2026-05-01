import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ProductoService, Producto, ModificarProducto
} from '../../../services/producto.service';

@Component({
  selector: 'app-editar-producto',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.css',
})
export class EditarProductoComponent implements OnInit {

  producto: Producto | null = null;
  cambios: ModificarProducto = {};
  error = '';
  exito = '';
  productoId: number = 0;

  constructor(
    private svc: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productoId = params['id'];
      this.cargarProducto();
    });
  }

  cargarProducto(): void {
    this.svc.obtenerProductos().subscribe({
      next: (productos) => {
        this.producto = productos.find(p => p.id === this.productoId) || null;
        if (this.producto) {
          this.cambios = { nombre: this.producto.nombre, precio: this.producto.precio, url_de_imagen: this.producto.url_de_imagen };
        } else {
          this.error = 'Producto no encontrado';
        }
      },
      error: () => this.error = 'Error al cargar el producto',
    });
  }

  guardarEdicion(): void {
    if (!this.producto) return;
    this.error = '';
    this.exito = '';
    this.svc.modificarProducto(this.producto.id, this.cambios).subscribe({
      next: () => {
        this.exito = 'Producto modificado exitosamente';
        this.producto = null;
      },
      error: () => this.error = 'Error al modificar producto',
    });
  }
}
