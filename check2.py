# check2.py
import asyncio, os
from uuid import UUID, uuid4
from dotenv import load_dotenv
load_dotenv()

from pymongo import MongoClient
from persistence_kit.repository_factory import set_registry_initializer, get_repo
from backend_persistence.persistence import register_defaults
from backend_persistence.entities import CompraProducto

DSN = os.getenv("MONGO_DSN", "mongodb://localhost:27017")
DB  = os.getenv("MONGO_DB", "prueba_aux")
SEED_CID = UUID("4e20a71d-56f9-42b3-9c88-20c258865493")


async def main():
    set_registry_initializer(register_defaults)
    join = get_repo("compra_producto")

    # 1) ¿el kit encuentra SU PROPIA escritura?
    cid = uuid4()
    nuevo = CompraProducto(compra_id=cid, producto_id=uuid4(), cantidad=9)
    await join.add(nuevo)
    propio = await join.list_by_fields({"compra_id": cid}, limit=None)
    print(f"[A] kit casa su propia escritura: {len(propio)}  (esperado 1)")
    await join.delete(nuevo.id)

    # 2) ¿con qué representación casa el dato SEMBRADO?
    for rep in ["standard", "pythonLegacy", "javaLegacy", "csharpLegacy"]:
        try:
            col = MongoClient(DSN, uuidRepresentation=rep)[DB]["compra_productos"]
            n = col.count_documents({"compra_id": SEED_CID})
            t = type(col.find_one().get("compra_id")).__name__
            print(f"[B] rep={rep:13} casa={n}  decodifica_como={t}")
        except Exception as e:
            print(f"[B] rep={rep:13} error: {e}")


asyncio.run(main())