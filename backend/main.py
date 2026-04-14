from contextlib import asynccontextmanager 
from backend.db import create_db_and_tables
from fastapi import FastAPI, Depends
from backend.web import usuario, producto, compra


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan = lifespan)


app.include_router(usuario.router)
app.include_router(producto.router)
app.include_router(compra.router)