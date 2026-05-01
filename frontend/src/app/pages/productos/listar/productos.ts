import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ProductoService, Producto
} from '../../../services/producto.service';

@Component({
  selector: 'app-listar-productos',
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ListarProductosComponent implements OnInit {

  productos: Producto[] = [];
  error = '';

  constructor(private svc: ProductoService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void{
    this.svc.obtenerProductos().subscribe({
      next: data => this.productos = data,
       error: () => this.error = 'Error al cargar',
    });
  }

  eliminar(id: number): void {
    this.svc.eliminarProducto(id).subscribe({
      next: () => this.cargar(),
      error: () => this.error = 'Error al eliminar producto',
    });
  }
}
