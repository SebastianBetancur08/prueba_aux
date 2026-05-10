from contextlib import asynccontextmanager 
from backend.db import create_db_and_tables
from backend.web import compra, producto
from fastapi import FastAPI, Depends
from backend.web import usuario

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan = lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(usuario.router)
app.include_router(producto.router)
app.include_router(compra.router)
