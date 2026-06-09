"""
Demostración end-to-end del bug de persistence-kit con una compra real.

Requiere Postgres y Mongo arriba (igual que la app). Corre:
    poetry run python demo_compra.py

Flujo:
  1. Crea un usuario, un producto y una COMPRA (vía los servicios, como la API).
  2. Consulta la compra SIN el arreglo  -> productos: []   (el BUG)
  3. Aplica el arreglo y consulta LA MISMA compra -> productos aparecen.
  4. Borra los datos de demostración.
"""
import asyncio
from decimal import Decimal
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

from persistence_kit.repository_factory import (
    set_registry_initializer, get_repo, get_repo_view,
)
from persistence_kit.repository.mongo_repo.mongo_repo import MongoRepository
from backend_persistence.persistence import register_defaults
from backend_persistence.services import usuario_service, producto_service, compra_service
from backend_persistence.models import CrearUsuario, CrearProducto, CrearCompra, CompraItem

INCLUDE = ["usuario", "productos"]


def aplicar_parche() -> None:
    """Traduce limit=None -> número grande, evitando el to_list(0) del kit."""
    original = MongoRepository.list_by_fields

    async def parcheado(self, criteria, *, offset=0, limit=50, sort_by=None, sort_desc=False):
        if limit is None:
            limit = 10_000_000
        return await original(
            self, criteria, offset=offset, limit=limit,
            sort_by=sort_by, sort_desc=sort_desc,
        )

    MongoRepository.list_by_fields = parcheado


async def ver_productos_de_la_compra(vista, compra_id):
    """Lo mismo que hace la app al mostrar una compra: resolver la relación 'productos'."""
    row = await vista.get_with(compra_id, include=INCLUDE)
    return row["productos"] if row else []


async def main() -> None:
    set_registry_initializer(register_defaults)
    usuarios  = get_repo("usuario")
    productos = get_repo("producto")
    compras   = get_repo("compra")
    join      = get_repo("compra_producto")
    vista     = get_repo_view("compra")

    # 1) Datos: usuario + producto + compra (vía los servicios, como la API)
    u = await usuario_service.crear(
        usuarios, CrearUsuario(nombre="DEMO Usuario", contraseña="x", email="demo@x.com")
    )
    p = await producto_service.crear(
        productos,
        CrearProducto(nombre=f"DEMO Producto {uuid4().hex[:6]}", precio=Decimal("9.99"), stock=100),
    )
    compra = await compra_service.crear(
        datos=CrearCompra(usuario_id=u.id, productos=[CompraItem(producto_id=p.id, cantidad=2)]),
        compras=compras, productos=productos, usuarios=usuarios, join=join, vista=vista,
    )
    print(f"Compra creada: {compra.id_compra}")
    print("(en Mongo quedó 1 documento de join apuntando a esta compra)\n")

    try:
        # 2) Ver la compra SIN el arreglo
        antes = await ver_productos_de_la_compra(vista, compra.id_compra)
        print("=== Al ver la compra SIN el arreglo ===")
        print(f"   productos -> {antes}")
        print(f"   total: {len(antes)}   <- LISTA VACÍA: el bug\n")

        # 3) Aplicar el arreglo y ver LA MISMA compra
        aplicar_parche()
        despues = await ver_productos_de_la_compra(vista, compra.id_compra)
        print("=== Al ver LA MISMA compra CON el arreglo ===")
        for pr in despues:
            print(f"   - producto_id={pr['producto_id']}  cantidad={pr['cantidad']}")
        print(f"   total: {len(despues)}   <- ahora SÍ aparecen los productos\n")

        ok = (len(antes) == 0 and len(despues) == 1)
        print("Resultado:", "BUG REPRODUCIDO Y CORREGIDO" if ok else "revisar entorno")
    finally:
        # 4) Limpieza (con el parche ya aplicado, el borrado del join funciona)
        aplicar_parche()
        await compra_service.eliminar(compra.id_compra, compras=compras, join=join)
        await producto_service.eliminar(productos, p.id)
        await usuario_service.eliminar(u.id, usuarios=usuarios, compras=compras, join=join)
        print("\n(datos de demostración eliminados)")


if __name__ == "__main__":
    asyncio.run(main())
