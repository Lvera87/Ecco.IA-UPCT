from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=True)
    hashed_password = Column(String(128), nullable=False)
    user_type = Column(String(20), default="residential")

    # Relaciones
    campuses = relationship("Campus", back_populates="user", cascade="all, delete-orphan")
    consumption_records = relationship("ConsumptionRecord", back_populates="user", cascade="all, delete-orphan")

