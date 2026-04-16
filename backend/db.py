from sqlmodel import create_engine, Session, SQLModel

DATABASE_URL = "postgresql+psycopg://api_user:1234@localhost:5432/database"

engine = create_engine(DATABASE_URL,echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session