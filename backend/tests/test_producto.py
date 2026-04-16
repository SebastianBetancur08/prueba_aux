from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
import pytest
from backend.db import get_session
from sqlmodel.pool import StaticPool
from backend.main import app


@pytest.fixture(name = "session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args ={"check_same_thread": False}, poolclass = StaticPool )
    
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name = "client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="producto")
def producto_fixture(client: TestClient):
    response = client.post("/producto/",
                           json={"nombre": "producto prueba",
                                 "precio": 10000.25,
                                 "url_de_imagen": "http//prueba"})
    
    return response.json()


def test_crear_prooducto(client: TestClient, producto):


    assert producto["precio"] == '10000.250'
    assert producto["nombre"] == "producto prueba"
    assert producto["url_de_imagen"] == "http//prueba"


def test_crear_producto_incompleto(client: TestClient, producto):
    response = client.post("/producto/", json={
        "url_de_imagen": "http//prueba"})

    assert response.status_code == 422


def test_crear_producto_duplicado(client: TestClient, producto):

    response = client.post("/producto/",
                           json={"nombre": "producto prueba",
                                 "precio": 10000.250,
                                 "url_de_imagen": "http//prueba"})

    assert response.status_code == 400


def test_leer_productos(client: TestClient, producto):
    response = client.get("/producto/")

    data = response.json()

    assert response.status_code == 200
    assert len(data) > 0
    assert producto["precio"] == '10000.250'
    assert producto["nombre"] == "producto prueba"
    assert producto["url_de_imagen"] == "http//prueba"


def test_leer_productos_paginacion(client: TestClient, producto):
    response = client.get("/producto/?minimo=0&maximo=1")

    data = response.json()

    assert response.status_code == 200
    assert len(data) <= 1


def test_leer_productos_maximo_invalido(client: TestClient):
    response = client.get("/producto/?maximo=200")

    assert response.status_code == 422


def test_buscar_productos(client: TestClient, producto):
    response = client.get(f"/producto/buscar_productos/?usuarios_id={producto['id']}")

    data = response.json()

    assert response.status_code == 200
    assert producto["precio"] == '10000.250'
    assert producto["nombre"] == "producto prueba"
    assert producto["url_de_imagen"] == "http//prueba"


def test_buscar_productos_inexistentes(client: TestClient):
    response = client.get("/producto/buscar_productos/?productos_id=25")

    assert response.status_code == 404


def test_modifcar_producto(client: TestClient, producto):
    response = client.patch(f"/producto/{producto['id']}", 
                        json = {"nombre": "hola",
                                "precio": 300,})
    
    data = response.json()

    assert data["nombre"] != producto["nombre"]
    assert data["precio"] != producto["precio"]


def test_modificar_producto_erroneo(client: TestClient, producto):
    
    # Sin cambios
    response_1 = client.patch(f"/producto/{producto["id"]}",
                              json = {})
    
    # Producto inexistente
    response_2 = client.patch("/producto/25",
                              json = {"nombre": "hola"})

    assert response_1.status_code == 422
    assert response_2.status_code == 404

def test_elimiar_producto(client: TestClient, producto):
    response = client.delete(f"/producto/{producto['id']}")

    assert response.status_code == 200


def test_eliminar_producto_inexistente(client: TestClient):
    response = client.delete("/producto/25")

    assert response.status_code == 404

