import pytest


@pytest.fixture
def producto(client):
    r = client.post("/producto/", json={
        "nombre": "producto prueba", "precio": 10000.25, "url_de_imagen": "http//prueba",
    })
    assert r.status_code == 200
    return r.json()


def test_crear_producto(producto):
    assert producto["precio"] == "10000.250"
    assert producto["nombre"] == "producto prueba"
    assert producto["url_de_imagen"] == "http//prueba"
    assert producto["estado"] == "agotado"          # stock 0 por defecto


def test_crear_producto_incompleto(client):
    r = client.post("/producto/", json={"url_de_imagen": "http//prueba"})
    assert r.status_code == 422


def test_crear_producto_duplicado(client, producto):
    r = client.post("/producto/", json={"nombre": "producto prueba", "precio": 10000.25})
    assert r.status_code == 400


def test_leer_productos(client, producto):
    r = client.get("/producto/")
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_leer_productos_paginacion(client, producto):
    r = client.get("/producto/?offset=0&limit=1")
    assert r.status_code == 200
    assert len(r.json()) <= 1


def test_leer_productos_limite_invalido(client):
    r = client.get("/producto/?limit=300")
    assert r.status_code == 422


def test_modificar_producto(client, producto):
    r = client.patch(f"/producto/{producto['id']}", json={"stock": 50})
    assert r.status_code == 200
    assert r.json()["estado"] == "disponible"


def test_eliminar_producto(client, producto):
    assert client.delete(f"/producto/{producto['id']}").status_code == 200


def test_eliminar_producto_inexistente(client, id_inexistente):
    assert client.delete(f"/producto/{id_inexistente}").status_code == 404
