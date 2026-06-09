import httpx
import random

BASE = "http://localhost:8004"

usuarios = [
    {"nombre": "Ana García", "email": "ana@example.com", "contraseña": "1234"},
    {"nombre": "Luis Martínez", "email": "luis@example.com", "contraseña": "1234"},
    {"nombre": "María López", "email": "maria@example.com", "contraseña": "1234"},
    {"nombre": "Carlos Rodríguez", "email": "carlos@example.com", "contraseña": "1234"},
    {"nombre": "Sofía Hernández", "email": "sofia@example.com", "contraseña": "1234"},
    {"nombre": "Pedro González", "email": "pedro@example.com", "contraseña": "1234"},
    {"nombre": "Laura Pérez", "email": "laura@example.com", "contraseña": "1234"},
    {"nombre": "Diego Torres", "email": "diego@example.com", "contraseña": "1234"},
    {"nombre": "Valentina Ruiz", "email": "valentina@example.com", "contraseña": "1234"},
    {"nombre": "Andrés Flores", "email": "andres@example.com", "contraseña": "1234"},
]

productos = [
    {"nombre": "Laptop", "precio": "1200.00", "stock": 50},
    {"nombre": "Mouse Inalámbrico", "precio": "25.99", "stock": 200},
    {"nombre": "Teclado Mecánico", "precio": "89.99", "stock": 100},
    {"nombre": "Monitor 27\"", "precio": "350.00", "stock": 30},
    {"nombre": "Auriculares Bluetooth", "precio": "79.99", "stock": 80},
    {"nombre": "Webcam HD", "precio": "55.00", "stock": 60},
    {"nombre": "Disco SSD 1TB", "precio": "110.00", "stock": 75},
    {"nombre": "Hub USB-C", "precio": "39.99", "stock": 120},
    {"nombre": "Silla Ergonómica", "precio": "450.00", "stock": 200},
    {"nombre": "Escritorio Ajustable", "precio": "320.00", "stock": 200},
]

with httpx.Client() as client:
    print("Creando usuarios...")
    usuario_ids = []
    for u in usuarios:
        r = client.post(f"{BASE}/usuario/", json=u)
        r.raise_for_status()
        usuario_ids.append(r.json()["id"])
        print(f"  {u['nombre']}")

    print("\nCreando productos...")
    producto_ids = []
    for p in productos:
        r = client.post(f"{BASE}/producto/", json=p)
        r.raise_for_status()
        producto_ids.append(r.json()["id"])
        print(f"  {p['nombre']}")

    print("\nCreando compras...")
    for i in range(60):
        usuario_id = random.choice(usuario_ids)
        n_productos = random.randint(1, 3)
        items = [
            {"producto_id": pid, "cantidad": random.randint(1, 3)}
            for pid in random.sample(producto_ids, n_productos)
        ]
        r = client.post(f"{BASE}/compra/", json={"usuario_id": usuario_id, "productos": items})
        r.raise_for_status()
        print(f"  Compra {i+1}/60 creada")

print("\nSeed completado.")
