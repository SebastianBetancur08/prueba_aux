from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session, delete
from backend.models import Usuario, Producto, Compra, CompraItem, CrearCompra, CompraProducto, CompraPublica, CompraProductoPublica, ModificarCompra
from backend.db import  get_session

router = APIRouter(prefix="/compra")

@router.post("/", response_model = CompraPublica)
def crear_compra(*,
    session: Session = Depends(get_session),
    compra_data: CrearCompra
    ):

    # Validar usuario
    usuario = session.get(Usuario, compra_data.usuario_id)
    if not usuario:
        raise HTTPException(status_code = 404, detail = "Usuario no existe")
    
    # validar productos
    for item in compra_data.productos:
        producto = session.get(Producto, item.producto_id)
        if not producto:
            raise HTTPException(status_code = 404, detail = f"Producto {item.producto_id} no existe")

    try:

        # crear compra
        db_compra = Compra(
            usuario_id = compra_data.usuario_id,
            total_productos=sum(item.cantidad for item in compra_data.productos)
            )

        session.add(db_compra)
        session.flush()

        # crear tabla intermedia
        for item in compra_data.productos:
            link = CompraProducto(
                compra_id=db_compra.id_compra,
                producto_id=item.producto_id,
                cantidad=item.cantidad
                )
            session.add(link)

        session.commit()
        session.refresh(db_compra)

    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Error creando la compra")


    
    productos_ids = [link.producto_id for link in db_compra.producto_link]

    db_productos=[]
    for link in db_compra.producto_link:
        db_productos.append(link)

    db_compra=CompraPublica(
            id_compra = db_compra.id_compra,
            usuario_id = db_compra.usuario_id,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_productos
            )
        
    session.commit()
    session.refresh(db_compra)

    return db_compra


@router.get("/{id_compra}", response_model = CompraPublica)
def obtener_compra(*,
    session: Session = Depends(get_session),
    id_compra: int):

    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} not found")
    
    productos_ids = [link.producto_id for link in db_compra.producto_link]

    db_productos=[]
    for link in db_compra.producto_link:
        db_productos.append(link)

    db_compra=CompraPublica(
            id_compra = db_compra.id_compra,
            usuario_id = db_compra.usuario_id,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_productos
            )
    
    return db_compra


@router.patch("/{id_compra}", response_model = CompraPublica)
def modificar_compra(*,
    session: Session = Depends(get_session),
    id_compra: int,
    compra_data: ModificarCompra,
    ):
    
    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = "Compra no encontrada")
    
    session.exec(delete(CompraProducto).where(CompraProducto.compra_id == id_compra))

    for item in compra_data.productos:
        link = CompraProducto(
        compra_id=id_compra,
        producto_id=item.producto_id,
        cantidad=item.cantidad
    )
    session.add(link)
    
    session.commit()