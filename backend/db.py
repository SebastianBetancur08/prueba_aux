from os import getenv
from sqlmodel import create_engine, Session, SQLModel

# Use DATABASE_URL from environment when available. Default to localhost Postgres.
# Example: postgresql+psycopg://api_user:1234@localhost:5432/db
DATABASE_URL = getenv("DATABASE_URL", "postgresql+psycopg://sebas:1234@localhost:5432/db")

engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session