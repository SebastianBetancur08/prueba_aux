from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session, delete
from backend.models import Usuario, Producto, Compra, CompraItem, CrearCompra, CompraProducto, CompraPublica, CompraProductoPublica, ModificarCompra
from backend.db import  get_session

router = APIRouter(prefix="/compra", tags=["compras"])

@router.post("/", response_model = CompraPublica)
def crear_compra(
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

    # crear compra
    db_compra = Compra(
        usuario_id = compra_data.usuario_id,
        total_productos = sum(item.cantidad for item in compra_data.productos)
    )

    session.add(db_compra)
    session.flush()

    # crear links
    for item in compra_data.productos:
        link = CompraProducto(
            compra_id = db_compra.id_compra,
            producto_id = item.producto_id,
            cantidad = item.cantidad
        )
        session.add(link)

    session.commit()
    session.refresh(db_compra)

    # crear compra publica
    compra_final = CompraPublica(
        id_compra = db_compra.id_compra,
        total_productos = db_compra.total_productos,
        usuario = db_compra.usuario,
        productos = db_compra.producto_link
    )

    return compra_final


@router.get("/", response_model=list[CompraPublica])
def historial_compras(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200)
):
    compras = session.exec(select(Compra).offset(skip).limit(limit)).all()
    return [
        CompraPublica(
            id_compra=c.id_compra,
            total_productos=c.total_productos,
            usuario=c.usuario,
            productos=c.producto_link
        )
        for c in compras
    ]


@router.get("/{id_compra}", response_model = CompraPublica)
def obtener_compra(*,
    session: Session = Depends(get_session),
    id_compra: int):
 
    # Valida si la compra existe
    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} not found")
    
    # Crear compra publica
    compra_final=CompraPublica(
            id_compra = db_compra.id_compra,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_compra.producto_link
            )
    
    return compra_final


@router.patch("/{id_compra}", response_model = CompraPublica)
def modificar_compra(*,
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
        
        # Eliminar links anteriores
        session.exec(delete(CompraProducto).where(CompraProducto.compra_id == id_compra))

        # Crear nuevos links
        for item in compra_data.productos:
            link = CompraProducto(
                compra_id = id_compra,
                producto_id = item.producto_id,
                cantidad = item.cantidad
                )
            session.add(link)
        
        # Calcular cantidad de productos
        db_compra.total_productos = sum(item.cantidad for item in compra_data.productos)

    # Añadir cambios, guardar cambios y refrescar cambios
    session.add(db_compra)
    session.commit()
    session.refresh(db_compra)

    compra_final = CompraPublica(
            id_compra = db_compra.id_compra,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_compra.producto_link
            )

    return compra_final


@router.delete("/{id_compra}")
def eliminar_compra(*,
    session: Session = Depends(get_session),
    id_compra: int
    ):

    #Validar si existe la compra
    db_compra=session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} no existe")

    # Eliminar compra y guardar cambios
    session.delete(db_compra)
    session.commit()

    return {"ok": True}
