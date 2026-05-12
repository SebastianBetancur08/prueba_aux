from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "prueba_aux"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def get_compra_productos_collection():
    return db["compra_productos"]