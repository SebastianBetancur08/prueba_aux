from sqlmodel import Field, Relationship, SQLModel
from decimal import Decimal


#=======================#
#--------USUARIO--------#
#=======================#


class Usuario(SQLModel, table = True):
    id: int | None = Field(default = None, primary_key = True)
    nombre: str = Field(index = True)
    email: str | None = Field(default = None)
    contraseña: str
    compras: list["Compra"] = Relationship(back_populates = "usuario", cascade_delete = True)


class UsuarioPublico(SQLModel):
    id: int
    nombre: str
    email: str | None = None


class CrearUsuario(SQLModel):
    nombre: str
    email: str | None = None
    contraseña: str


class ModificarUsuario(SQLModel):
    id: int | None = None
    nombre: str | None = None
    email: str | None = None
    contraseña: str | None = None


#========================#
#----Tabla Intermedia----#
#========================#


class CompraProducto(SQLModel, table = True):
    compra_id: int | None = Field(default= None, foreign_key = "compra.id_compra", primary_key = True)
    producto_id: int | None = Field(default= None, foreign_key = "producto.id", primary_key = True)
    compra: "Compra" = Relationship(back_populates = "producto_link")
    producto: "Producto" = Relationship(back_populates = "compra_link")
    cantidad: int = Field(default = 1)


class CompraProductoPublica(SQLModel):
    producto_id: int
    cantidad: int


#========================#
#--------PRODUCTO--------#
#========================#


class Producto(SQLModel, table = True):
    id: int | None = Field(default = None, primary_key = True)
    nombre: str = Field(index = True, unique = True)
    precio: Decimal = Field(default = 0, max_digits = 10, decimal_places = 3)
    url_de_imagen: str | None = Field(default=None)
    compra_link: list[CompraProducto] = Relationship(back_populates = "producto", cascade_delete = True)


class CrearProducto(SQLModel):
    nombre: str 
    precio: Decimal 
    url_de_imagen: str | None = None


class ModificarProducto(SQLModel):
    nombre: str | None = None
    precio: Decimal | None = None
    url_de_imagen: str | None = None


#=========================#
#---------COMPRA----------#
#=========================#


class Compra(SQLModel, table = True):
    id_compra: int | None = Field(default = None, primary_key = True)
    usuario_id: int = Field(foreign_key="usuario.id")
    total_productos: int = Field(default = 1)
    usuario: "Usuario" = Relationship(back_populates = "compras")
    producto_link: list[CompraProducto] = Relationship(back_populates = "compra", cascade_delete = True)


class CompraPublica(SQLModel):
    id_compra: int
    usuario: "UsuarioPublico"
    total_productos: int
    productos: list[CompraProductoPublica]


class CompraItem(SQLModel):
    producto_id: int
    cantidad: int = Field(default = 1)


class CrearCompra(SQLModel):
    usuario_id: int
    productos: list[CompraItem]


class ModificarCompra(SQLModel):
    usuario_id: int | None = None
    productos: list[CompraItem] | None = None