from persistence_kit import Database
from persistence_kit.repository_factory import register_entity

from backend_persistence.entities import Usuario, Producto, Compra, CompraProducto


def _configs(*, usuario_db, producto_db, compra_db, join_db) -> None:
    register_entity("usuario", {
        "entity": Usuario, "collection": "usuarios", "database": usuario_db,
        "relations": {
            "compras": {"target": "compra", "local_field": "id", "target_field": "usuario_id", "many": True},
        },
    })
    register_entity("producto", {
        "entity": Producto, 
        "collection": "productos", 
        "database": producto_db,
        "unique": {"nombre": "nombre"},
    })
    register_entity("compra", {
        "entity": Compra, 
        "collection": "compras", 
        "database": compra_db,
        "relations": {
            "usuario":   {"local_field": "usuario_id", "target": "usuario", "by": "id"},
            "productos": {"target": "compra_producto", "local_field": "id", "target_field": "compra_id", "many": True},
        },
    })
    register_entity("compra_producto", {
        "entity": CompraProducto, 
        "collection": "compra_productos", 
        "database": join_db,
    })


def register_defaults() -> None:
    """Producción: híbrido fiel al diseño (Postgres + Mongo)."""
    _configs(
        usuario_db=Database.POSTGRES,
        producto_db=Database.POSTGRES,
        compra_db=Database.POSTGRES,
        join_db=Database.MONGO,
    )


def register_for_tests() -> None:
    """Tests: todo en memoria, sin Postgres ni Mongo."""
    m = Database.MEMORY
    _configs(usuario_db=m, producto_db=m, compra_db=m, join_db=m)
