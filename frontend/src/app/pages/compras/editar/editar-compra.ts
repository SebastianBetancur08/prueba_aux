import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService, CompraPublica, CompraItem, ModificarCompra } from '../../../services/compra.service';

@Component({
  selector: 'app-editar-compra',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-compra.html',
  styleUrl: './editar-compra.css',
})
export class EditarCompraComponent implements OnInit {

  compra: CompraPublica | null = null;
  error = '';
  exito = '';
  cargando = false;
  compraId: number = 0;
  modificarUsuario = false;
  modificarListaProductos = false;
  nuevoUsuarioId: number | null = null;
  productosModificados: CompraItem[] = [{ producto_id: 0, cantidad: 1 }];

  constructor(
    private svc: CompraService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.compraId = +params['id'];
      this.cargarCompra();
    });
  }

  cargarCompra(): void {
    this.error = '';
    this.svc.obtenerCompra(this.compraId).subscribe({
      next: (data) => {
        this.compra = data;
        this.nuevoUsuarioId = data.usuario.id;
        this.productosModificados = data.productos.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Compra no encontrada';
        this.cdr.detectChanges();
      },
    });
  }

  agregarItem(): void {
    this.productosModificados.push({ producto_id: 0, cantidad: 1 });
  }

  eliminarItem(index: number): void {
    if (this.productosModificados.length > 1) {
      this.productosModificados.splice(index, 1);
    }
  }

  modificar(): void {
    if (!this.compra) return;

    const cambios: ModificarCompra = {};

    if (this.modificarUsuario) {
      if (!this.nuevoUsuarioId || this.nuevoUsuarioId <= 0) {
        this.error = 'Ingresa un ID de usuario válido';
        return;
      }
      cambios.usuario_id = this.nuevoUsuarioId;
    }

    if (this.modificarListaProductos) {
      if (this.productosModificados.some(p => p.producto_id <= 0 || p.cantidad <= 0)) {
        this.error = 'Todos los productos deben tener ID y cantidad válidos';
        return;
      }
      cambios.productos = [...this.productosModificados];
    }

    if (!cambios.usuario_id && !cambios.productos) {
      this.error = 'Selecciona al menos un campo para modificar';
      return;
    }

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.svc.modificarCompra(this.compra.id_compra, cambios).subscribe({
      next: (data) => {
        this.compra = data;
        this.exito = 'Compra modificada exitosamente';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al modificar compra';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/compras/listar']);
  }
}