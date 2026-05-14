from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session
from backend.models import Usuario, Producto, Compra, CompraItem, CrearCompra,  CompraPublica, CompraProductoPublica, ModificarCompra
from backend.db import  get_session
from backend.mongo import get_compra_productos_collection

router = APIRouter(prefix="/compra", tags=["compras"])

@router.post("/", response_model = CompraPublica)
async def crear_compra(
    *,
    session: Session = Depends(get_session),
    compra_data: CrearCompra
):
    
    # Validar si hay almenos una compra
    if not compra_data.productos:
        raise HTTPException(status_code = 400, detail = "La compra debe tener al menos un producto")

    # validar usuario
    usuario = session.get(Usuario, compra_data.usuario_id)
    if not usuario:
        raise HTTPException(404, f"Usuario {compra_data.usuario_id} no existe")

    # obtener ids productos
    productos_ids = [item.producto_id for item in compra_data.productos]

    # validar productos en una sola consulta
    productos = session.exec(
        select(Producto).where(Producto.id.in_(productos_ids))
    ).all()

    if len(productos_ids) != len(set(productos_ids)):
        raise HTTPException(status_code = 400, detail = "Productos repetidos en la compra")

    if len(productos) != len(productos_ids):
        raise HTTPException(status_code = 404, detail =  "Uno o más productos no existen")

    # validar y descontar stock
    cantidad_por_producto = {item.producto_id: item.cantidad for item in compra_data.productos}
    for producto in productos:
        cantidad = cantidad_por_producto[producto.id]
        if producto.stock < cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})")
        producto.stock -= cantidad
        session.add(producto)

    # crear compra
    db_compra = Compra(
        usuario_id = compra_data.usuario_id,
        total_productos = sum(item.cantidad for item in compra_data.productos)
    )

    session.add(db_compra)
    session.flush()

    collection = get_compra_productos_collection()
    docs = [{"compra_id": db_compra.id_compra, "producto_id": item.producto_id, "cantidad": item.cantidad}
        for item in compra_data.productos]
    await collection.insert_many(docs)


    session.commit()
    session.refresh(db_compra)

    # crear compra publica
    compra_final = CompraPublica(
        id_compra = db_compra.id_compra,
        total_productos = db_compra.total_productos,
        usuario = db_compra.usuario,
        productos = [CompraProductoPublica(producto_id=d["producto_id"], cantidad=d["cantidad"]) for d in docs]
    )

    return compra_final


@router.get("/", response_model=list[CompraPublica])
async def historial_compras(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200)
):
    compras = session.exec(select(Compra).offset(skip).limit(limit)).all()
    collection = get_compra_productos_collection()
    resultado = []
    for c in compras:
        docs = await collection.find({"compra_id": c.id_compra}).to_list()
        resultado.append(CompraPublica(
            id_compra=c.id_compra,
            total_productos=c.total_productos,
            usuario=c.usuario,
            productos=[CompraProductoPublica(producto_id=d["producto_id"], cantidad=d["cantidad"]) for d in docs]
        ))
    return resultado


@router.get("/{id_compra}", response_model = CompraPublica)
async def obtener_compra(*,
    session: Session = Depends(get_session),
    id_compra: int):
 
    # Valida si la compra existe
    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} not found")
    
    # Crear compra publica
    docs = await get_compra_productos_collection().find({"compra_id": id_compra}).to_list()
    compra_final = CompraPublica(
            id_compra = db_compra.id_compra,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = [CompraProductoPublica(producto_id=d["producto_id"], cantidad=d["cantidad"]) for d in docs]
            )

    return compra_final


@router.patch("/{id_compra}", response_model = CompraPublica)
async def modificar_compra(*,
    session: Session = Depends(get_session),
    id_compra: int,
    compra_data: ModificarCompra,
    ):
    
    # Validar si se ingresan cambios
    cambios = compra_data.model_dump(exclude_unset=True)
    if not cambios:
        raise HTTPException(status_code=422, detail="Ingresar al menos un cambio")

    # Validad si existe la compra
    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} no existe")
    
    # Actualizar usuario_id en compra si se proporocioiona
    if compra_data.usuario_id  is not None:

        # Validar si existe el usuario proporcionado
        usuario = session.get(Usuario, compra_data.usuario_id )
        if not usuario:
            raise HTTPException(status_code = 404, detail=f"Usuario {compra_data.usuario_id} no existe")
        db_compra.usuario_id = compra_data.usuario_id
    
    # Actulizar productos en compra si se proporciona
    if compra_data.productos is not None:

        # obtener ids productos nuevos
        productos_ids = [item.producto_id for item in compra_data.productos]

        if len(productos_ids) != len(set(productos_ids)):
            raise HTTPException(status_code = 400, detail = "Productos repetidos en la compra")

        # validar productos nuevos en una sola consulta
        productos_nuevos = session.exec(
            select(Producto).where(Producto.id.in_(productos_ids))
        ).all()

        if len(productos_nuevos) != len(productos_ids):
            raise HTTPException(status_code = 404, detail =  "Uno o más productos no existen")

        collection = get_compra_productos_collection()

        # restaurar stock de productos anteriores
        docs_anteriores = await collection.find({"compra_id": id_compra}).to_list()
        ids_anteriores = [d["producto_id"] for d in docs_anteriores]
        productos_anteriores = session.exec(
            select(Producto).where(Producto.id.in_(ids_anteriores))
        ).all()
        cantidad_anterior = {d["producto_id"]: d["cantidad"] for d in docs_anteriores}
        for producto in productos_anteriores:
            producto.stock += cantidad_anterior[producto.id]
            session.add(producto)

        # validar y descontar stock nuevo
        cantidad_nueva = {item.producto_id: item.cantidad for item in compra_data.productos}
        for producto in productos_nuevos:
            cantidad = cantidad_nueva[producto.id]
            if producto.stock < cantidad:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})")
            producto.stock -= cantidad
            session.add(producto)

        await collection.delete_many({"compra_id": id_compra})
        docs = [{"compra_id": id_compra, "producto_id": item.producto_id, "cantidad": item.cantidad}
                for item in compra_data.productos]
        await collection.insert_many(docs)

        # Calcular cantidad de productos
        db_compra.total_productos = sum(item.cantidad for item in compra_data.productos)

    # Añadir cambios, guardar cambios y refrescar cambios
    session.add(db_compra)
    session.commit()
    session.refresh(db_compra)

    docs = await get_compra_productos_collection().find({"compra_id": id_compra}).to_list()
    compra_final = CompraPublica(
            id_compra = db_compra.id_compra,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = [CompraProductoPublica(producto_id=d["producto_id"], cantidad=d["cantidad"]) for d in docs]
            )

    return compra_final


@router.delete("/{id_compra}")
async def eliminar_compra(*,
    session: Session = Depends(get_session),
    id_compra: int
    ):

    #Validar si existe la compra
    db_compra=session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} no existe")

    # Eliminar documentos de Mongo antes de borrar la compra
    await get_compra_productos_collection().delete_many({"compra_id": id_compra})

    # Eliminar compra y guardar cambios
    session.delete(db_compra)
    session.commit()

    return {"ok": True}
