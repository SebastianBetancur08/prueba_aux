"""
Parche temporal para un bug de persistence-kit (MongoRepository.list_by_fields).

El kit hace `cursor.to_list(length=0 if limit is None else limit)`, y en Motor
`to_list(0)` devuelve CERO documentos. Como el ViewRepository resuelve las
relaciones inversas llamando `list_by_fields(..., limit=None)`, esas relaciones
(p. ej. los productos de una compra) salían siempre vacías.

Aquí interceptamos `list_by_fields`: si llega `limit=None`, lo traducimos a un
número grande (efectivamente "todos"), evitando el `to_list(0)`.

Importar este módulo UNA vez, antes de usar los repos (al inicio de main.py).
Quitar cuando el kit corrija el bug (mongo_repo.py: to_list(length=limit)).
"""
from persistence_kit.repository.mongo_repo.mongo_repo import MongoRepository

_TODOS = 10_000_000  # tope práctico equivalente a "sin límite"

_orig_list_by_fields = MongoRepository.list_by_fields


async def _list_by_fields_fixed(
    self,
    criteria,
    *,
    offset: int = 0,
    limit=50,
    sort_by=None,
    sort_desc: bool = False,
):
    if limit is None:
        limit = _TODOS
    return await _orig_list_by_fields(
        self,
        criteria,
        offset=offset,
        limit=limit,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )


# aplicar el parche una sola vez (idempotente ante reimports)
if getattr(MongoRepository.list_by_fields, "__name__", "") != "_list_by_fields_fixed":
    MongoRepository.list_by_fields = _list_by_fields_fixed
