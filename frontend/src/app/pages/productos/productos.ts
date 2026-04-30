import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
    ProductoService, Producto, CrearProducto, ModificarProducto 
} from '../../services/producto.service';

@Component({
  selector: 'app-productos',
  imports: [FormsModule, CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})

export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  error = '';
  nuevoProducto: CrearProducto = {nombre:'', precio: 0, url_de_imagen: ''};
  editando: Producto | null = null;
  cambios: ModificarProducto = {};

  constructor(private svc: ProductoService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void{
    this.svc.obtenerProductos().subscribe({
      next: data => this.productos = data,
       error: () => this.error = 'Error al cargar',
    });
  }

  crear(): void {
    this.svc.crearProducto(this.nuevoProducto).subscribe({
      next: () => { this.nuevoProducto = {nombre:'', precio: 0, url_de_imagen: ''};
                    this.cargar(); },
      error: () => this.error = 'Error al crear producto',
    });
  }
    
  iniciarEdicion(p: Producto): void {
    this.editando = p;
    this.cambios = { nombre: p.nombre, precio: p.precio, url_de_imagen: p.url_de_imagen };
  }
  
  guardarEdicion(): void {
    if (!this.editando) return;
    this.svc.modificarProducto(this.editando.id, this.cambios).subscribe({
      next: () => { this.editando = null; this.cargar(); },
      error: () => this.error = 'Error al modificar prodcuto',
    });
  }
    
  eliminar(id: number): void {
    this.svc.eliminarProducto(id).subscribe({
      next: () => this.cargar(),
      error: () => this.error = 'Error al eliminar producto',
    });
  }
}