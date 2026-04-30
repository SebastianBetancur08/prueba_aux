import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
    CompraItem, CompraProductoPublica, CompraPublica, CompraService, CrearCompra, ModificarCompra
} from '../../services/compra.service';

@Component({
  selector: 'app-compras',
  imports: [FormsModule, CommonModule],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})

export class ComprasComponent implements OnInit {

  compra: CompraPublica | null = null;
  error = '';
  buscarId = 0;
  nueva: CrearCompra = { 
    usuario_id: 0, 
    productos: [{producto_id: 0, cantidad: 1}]
  }

  modificacion: ModificarCompra = {
    usuario_id: null,
    productos: null,
  };
  modificarProductos: CompraItem[] = [{producto_id: 0, cantidad: 1}];
  modificarUsuario = false;
  modificarListaProductos = false;

  constructor(private svc: CompraService) {}
  ngOnInit(): void {}

  buscar(): void {
    this.svc.obtenerCompra(this.buscarId).subscribe({
      next: data => { this.compra = data; this.error = ''; },
      error: () => this.error = 'Compra no encontrada',
    });
  }

  agregarItem(): void {
    this.nueva.productos.push({producto_id: 0, cantidad: 1});
  }

  crear(): void {
    this.svc.crearCompra(this.nueva).subscribe({
      next: data => { this.compra = data; this.error = ''; },
      error: () => this.error = 'Error al crear compra',
    });
  }

  eliminar(): void {
    if (!this.compra) return;
    this.svc.eliminarCompra(this.compra.id_compra).subscribe({
      next: () => { this.compra = null; this.error = ''; },
      error: () => this.error = 'Error al eliminar',
    });
  }

  agregarItemModificacion(): void {
    this.modificarProductos.push({producto_id: 0, cantidad: 1});
  }

  eliminarItemModificacion(index: number): void {
    this.modificarProductos.splice(index, 1);
  }

  modificar(): void {
    if (!this.compra) return;

    const cambios: ModificarCompra = {};

    if (this.modificarUsuario && this.modificacion.usuario_id != null) {
      cambios.usuario_id = this.modificacion.usuario_id;
    }

    if (this.modificarListaProductos) {
      cambios.productos = [...this.modificarProductos];
    }

    if (cambios.usuario_id === undefined && cambios.productos === undefined) {
      this.error = 'Selecciona al menos un campo para modificar';
      return;
    }

    this.svc.modificarCompra(this.compra.id_compra, cambios).subscribe({
      next: data => { this.compra = data; this.error = ''; },
      error: () => this.error = 'Error al modificar compra',
    });
  }
}
