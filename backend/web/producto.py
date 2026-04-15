from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select, Session
from backend.models import Producto, CrearProducto, ModificarProducto
from backend.db import  get_session


router = APIRouter(prefix="/producto")


@router.post("/", response_model = list[Producto])
def crear_productos(*,
     session: Session = Depends(get_session), 
     productos: list[CrearProducto]
     ):
    
    db_productos  = []
    for producto in productos:
        db_producto = Producto.model_validate(producto)
        session.add(db_producto)
        db_productos.append(db_producto)

    try:
        session.commit()
    except IntegrityError:
        raise HTTPException(status_code = 400, detail = "Uno o mas IDs ya existen en la base de datos")

    for producto in db_productos:
        session.refresh(producto)

    return db_productos


@router.get("/", response_model = list[Producto])
def leer_productos(*, 
    minimo: int = 0, 
    maximo: int = Query(default=100, le=100), 
    session: Session = Depends(get_session), 
    ):

    productos=session.exec(select(Producto).offset(minimo).limit(maximo)).all()

    return productos


@router.get("/buscar_productos/", response_model= list[Producto])
def buscar_productos(*, 
    session: Session = Depends(get_session),
    productos_id: list[int] = Query(default=[]) 
    ):
    
    # Buscar productos
    productos=[]
    for producto_id in productos_id:
        producto = session.get(Producto, producto_id)
        
        # Validar producto
        if not producto:
            raise HTTPException(status_code = 404, detail = f"Producto {producto_id} not found")
        productos.append(producto)

    return productos


@router.patch("/{producto_id}", response_model = Producto)
def modificar_producto(
    *,
    session: Session = Depends(get_session),
    producto_id: int,
    producto: ModificarProducto
):
    
    # Validar producto
    db_producto = session.get(Producto, producto_id)
    if not db_producto:
        raise HTTPException(status_code = 404, detail = "Producto no encontrado")
    
    #  # Añadir cambios, guardar y refrescar
    producto_data = producto.model_dump(exclude_unset=True)
    db_producto.sqlmodel_update(producto_data)
    session.add(db_producto)
    session.commit()
    session.refresh(db_producto)

    return db_producto


@router.delete("/{producto_id}")
def eliminar_producto(*, 
    session: Session = Depends(get_session), 
    producto_id: int
    ):
     
    # Validar producto
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code = 404, detail = "Producto not found")
    
    # Eliminar producto y guardar cambios
    session.delete(producto)
    session.commit()

    return {"ok": True}