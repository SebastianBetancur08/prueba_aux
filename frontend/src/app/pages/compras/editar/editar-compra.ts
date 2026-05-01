import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
    CompraService, CompraPublica, CompraItem, ModificarCompra
} from '../../../services/compra.service';

@Component({
  selector: 'app-editar-compra',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-compra.html',
  styleUrl: './editar-compra.css',
})
export class EditarCompraComponent implements OnInit {

  compra: CompraPublica | null = null;
  error = '';
  exito = '';
  compraId: number = 0;

  modificacion: ModificarCompra = {
    usuario_id: null,
    productos: null,
  };
  modificarProductos: CompraItem[] = [{producto_id: 0, cantidad: 1}];
  modificarUsuario = false;
  modificarListaProductos = false;

  constructor(
    private svc: CompraService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.compraId = params['id'];
      this.cargarCompra();
    });
  }

  cargarCompra(): void {
    this.svc.obtenerCompra(this.compraId).subscribe({
      next: data => {
        this.compra = data;
        this.modificarProductos = data.productos || [];
        this.error = '';
      },
      error: () => this.error = 'Compra no encontrada',
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

    this.error = '';
    this.exito = '';
    this.svc.modificarCompra(this.compra.id_compra, cambios).subscribe({
      next: data => {
        this.compra = data;
        this.exito = 'Compra modificada exitosamente';
      },
      error: () => this.error = 'Error al modificar compra',
    });
  }
}
