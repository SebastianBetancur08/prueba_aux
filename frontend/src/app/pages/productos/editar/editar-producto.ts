import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService, Producto, ModificarProducto } from '../../../services/producto.service';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.css',
})
export class EditarProductoComponent implements OnInit {

  producto: Producto | null = null;
  cambios: ModificarProducto = {};
  error = '';
  exito = '';
  cargando = false;
  productoId: number = 0;

  constructor(
    private svc: ProductoService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productoId = +params['id'];
      this.cargarProducto();
    });
  }

  cargarProducto(): void {
    this.error = '';
    this.svc.buscarProductos([this.productoId]).subscribe({
      next: (productos) => {
        if (productos.length === 0) {
          this.error = 'Producto no encontrado';
          this.cdr.detectChanges();
          return;
        }
        this.producto = productos[0];
        this.cambios = {
          nombre: this.producto.nombre,
          precio: this.producto.precio,
          url_de_imagen: this.producto.url_de_imagen,
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar el producto';
        this.cdr.detectChanges();
      },
    });
  }

  guardarEdicion(): void {
    if (!this.producto) return;

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

    this.svc.modificarProducto(this.producto.id, this.cambios).subscribe({
      next: (productoActualizado) => {
        this.exito = 'Producto modificado exitosamente';
        this.producto = productoActualizado;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al modificar producto';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  irAListar(): void {
    this.router.navigate(['/productos/listar']);
  }
}