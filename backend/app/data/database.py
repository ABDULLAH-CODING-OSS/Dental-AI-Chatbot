from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./dental_chatbot.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations():
    """Ensure database schema has required columns for backward compatibility."""
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "chat_sessions" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("chat_sessions")]
                if "updated_at" not in columns:
                    conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN updated_at DATETIME;"))
                    conn.execute(text("UPDATE chat_sessions SET updated_at = created_at WHERE updated_at IS NULL;"))
                    conn.commit()
    except Exception as e:
        print(f"Migration check notice: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
