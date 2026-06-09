"""
Demostración del bug de persistence-kit (MongoRepository con limit=None).

Corre con Mongo arriba:
    poetry run python demo_bug.py

Muestra, sobre EL MISMO documento y LA MISMA consulta:
  1) la raíz: el cursor crudo con to_list(0) devuelve [].
  2) el kit SIN parche: list_by_fields(limit=None) -> 0  (BUG).
  3) el kit CON parche: list_by_fields(limit=None) -> 1  (ARREGLADO).
"""
import asyncio
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

from persistence_kit.repository_factory import set_registry_initializer, get_repo
from persistence_kit.repository.mongo_repo.mongo_repo import MongoRepository
from backend_persistence.persistence import register_defaults
from backend_persistence.entities import CompraProducto


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


async def main() -> None:
    set_registry_initializer(register_defaults)
    join = get_repo("compra_producto")

    cid = uuid4()
    doc = CompraProducto(compra_id=cid, producto_id=uuid4(), cantidad=3)
    await join.add(doc)
    print(f"Insertado 1 documento (compra_id={cid})\n")

    try:
        col = join._col
        print("=== 1) Raíz: el cursor crudo de Mongo ===")
        print("   to_list(length=5)    ->", len(await col.find({"compra_id": cid}).to_list(length=5)))
        print("   to_list(length=None) ->", len(await col.find({"compra_id": cid}).to_list(length=None)))
        print("   to_list(length=0)    ->", len(await col.find({"compra_id": cid}).to_list(length=0)),
              "  <- el kit pasa 0 cuando limit=None")
        print()

        print("=== 2) Kit SIN parche ===")
        print("   list_by_fields(limit=10)   ->", len(await join.list_by_fields({"compra_id": cid}, limit=10)))
        n_bug = len(await join.list_by_fields({"compra_id": cid}, limit=None))
        print("   list_by_fields(limit=None) ->", n_bug, "  <- BUG: lista vacía")
        print()

        aplicar_parche()

        print("=== 3) Kit CON parche (mismo doc, misma consulta) ===")
        print("   list_by_fields(limit=10)   ->", len(await join.list_by_fields({"compra_id": cid}, limit=10)))
        n_fix = len(await join.list_by_fields({"compra_id": cid}, limit=None))
        print("   list_by_fields(limit=None) ->", n_fix, "  <- ARREGLADO")
        print()

        print("Resultado:", "BUG REPRODUCIDO Y CORREGIDO" if (n_bug == 0 and n_fix == 1) else "revisar entorno")
    finally:
        await join.delete(doc.id)
        print("\n(documento de prueba eliminado)")


if __name__ == "__main__":
    asyncio.run(main())