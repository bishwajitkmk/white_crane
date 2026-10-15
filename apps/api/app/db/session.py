from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Sized for one API process: AnyIO runs sync routes on up to 40 threads, and Neon closes idle connections.
pool = {} if settings.database_url.startswith("sqlite") else {"pool_size": 10, "max_overflow": 20, "pool_recycle": 300}
engine = create_engine(settings.database_url, pool_pre_ping=True, **pool)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
