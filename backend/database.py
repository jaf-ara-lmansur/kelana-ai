from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# memuat .env supaya os.gatenv() bisa membacanya
load_dotenv()

#koneksi string dari .env - jangan pernah di hatkord
DATABASE_URL = os.getenv("DATABASE_URL")

#engine = connection pool
engine=create_engine(DATABASE_URL)

#sessionLocal = a factory for DB Session
sessionLocal = sessionmaker(bind=engine, autoflush=False)

#base = all ORM models inherit from
Base = declarative_base()

#create all tabls
def init_db() -> None:
    """ Create all SQLAlchemy tables for configured database."""
    Base.metadata.create_all (bind=engine)