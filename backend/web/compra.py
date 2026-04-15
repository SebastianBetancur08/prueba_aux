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
        raise HTTPException(status_code = 404, detail = f"Usuario {compra_data.usuario_id} no existe")
    
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

    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Error creando la compra")
    
    # Guardar y refrescar ANTES de construir CompraPublica
    session.commit()
    session.refresh(db_compra)

    # crear compra publica
    db_compra=CompraPublica(
            id_compra = db_compra.id_compra,
            usuario_id = db_compra.usuario_id,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_compra.producto_link
            )
    # Guardar compra y refrescar compra
    session.commit()
    session.refresh(db_compra)

    return db_compra


@router.get("/{id_compra}", response_model = CompraPublica)
def obtener_compra(*,
    session: Session = Depends(get_session),
    id_compra: int):
 
    # Valida si la compra existe
    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} not found")
    
    # Crear compra publica
    db_compra=CompraPublica(
            id_compra = db_compra.id_compra,
            usuario_id = db_compra.usuario_id,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_compra.producto_link
            )
    
    return db_compra


@router.patch("/{id_compra}", response_model = CompraPublica)
def modificar_compra(*,
    session: Session = Depends(get_session),
    id_compra: int,
    compra_data: ModificarCompra,
    ):
    
    # Validad si existe la compra
    db_compra = session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = f"Compra {id_compra} no existe")
    
    # Actualizar usuario_id en compra si se proporociciona
    if compra_data.usuario_id  is not None:

        # Validar si existe el usuario
        usuario = session.get(Usuario, compra_data.usuario_id )
        if not usuario:
            raise HTTPException(status_code=404, detail=f"Usuario {compra_data.usuario_id} no existe")
        db_compra.usuario_id = compra_data.usuario_id
    
    # Actulizar productos en compra si se proporciona
    if compra_data.productos is not None:

        # Validar si existe cada producto existe antes de modificar
        for item in compra_data.productos:
            producto = session.get(Producto, item.producto_id)
            if not producto: 
                raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no existe")
        
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

    db_compra = CompraPublica(
            id_compra = db_compra.id_compra,
            usuario_id = db_compra.usuario_id,
            total_productos = db_compra.total_productos,
            usuario = db_compra.usuario,
            productos = db_compra.producto_link
            )

    return db_compra


@router.delete("/{id_compra}")
def eliminar_compra(*,
    session: Session = Depends(get_session),
    id_compra: int
    ):

    #Validar si existe la compra
    db_compra=session.get(Compra, id_compra)
    if not db_compra:
        raise HTTPException(status_code = 404, detail = "Compra {id_compra} no existe")

    # Eliminar compra y guardar cambios
    session.delete(Compra, id_compra)
    session.commit()

    return {"Ok": True}