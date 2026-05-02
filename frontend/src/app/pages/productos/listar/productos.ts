import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../../services/producto.service';

@Component({
  selector: 'app-listar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ListarProductosComponent implements OnInit {

  buscarPorId: number | null = null;
  buscandoProducto = false;
  productoBuscado: Producto | null = null;
  mostrarConfirmacion = false;
  idAEliminar: number | null = null;
  error = '';

  constructor(private svc: ProductoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  buscarPorIdProducto(): void {
    if (!this.buscarPorId) {
      this.error = 'Por favor ingresa un ID de producto';
      return;
    }

    const id = Number(this.buscarPorId);
    if (isNaN(id)) {
      this.error = 'El ID debe ser un número válido';
      return;
    }

    this.buscandoProducto = true;
    this.error = '';
    this.productoBuscado = null;

    this.svc.buscarProductos([id]).subscribe({
      next: (data) => {
        this.productoBuscado = data.length > 0 ? data[0] : null;
        if (!this.productoBuscado) this.error = `No se encontró producto con ID ${id}`;
        this.buscandoProducto = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = `Error al buscar producto con ID ${id}`;
        this.buscandoProducto = false;
        this.cdr.detectChanges();
      },
    });
  }

  limpiarBusqueda(): void {
    this.buscarPorId = null;
    this.productoBuscado = null;
    this.error = '';
  }

  eliminar(id: number): void {
    this.idAEliminar = id;
    this.mostrarConfirmacion = true;
  }

  confirmarEliminar(): void {
    if (!this.idAEliminar) return;
    this.mostrarConfirmacion = false;
    this.error = '';
    this.svc.eliminarProducto(this.idAEliminar).subscribe({
      next: () => {
        this.productoBuscado = null;
        this.idAEliminar = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al eliminar producto';
        this.idAEliminar = null;
        this.cdr.detectChanges();
      },
    });
  }

  cancelarEliminar(): void {
    this.mostrarConfirmacion = false;
    this.idAEliminar = null;
  }
}