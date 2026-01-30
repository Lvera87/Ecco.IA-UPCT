from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class CampusProfile(Base):
    """
    Representa una Sede de la UPTC.
    Mapeado a la tabla 'campuses' generada por Alembic.
    """
    __tablename__ = "campuses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(100), nullable=False) # Antes campus_name
    location_city = Column(String(100), nullable=True) # Antes city
    
    # Métricas de Infraestructura
    total_area_sqm = Column(Float, nullable=True)
    
    # Población
    population_students = Column(Integer, default=0)
    population_staff = Column(Integer, default=0)
    
    # Configuración Energética
    primary_usage = Column(String(100), nullable=True) # ej. Académico, Laboratorios
    baseline_energy_kwh = Column(Float, nullable=True)
    target_reduction_percent = Column(Float, nullable=True)
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="campus_profile")
    assets = relationship("InstitutionalAsset", back_populates="campus", cascade="all, delete-orphan")
    consumption_records = relationship("ConsumptionRecord", back_populates="campus", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('population_students >= 0', name='check_pos_students'),
    )

class InstitutionalAsset(Base):
    """
    Activos de consumo energético institucional.
    Mapeado a la tabla 'infrastructure_units' generada por Alembic.
    """
    __tablename__ = "infrastructure_units"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campuses.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(100), nullable=False)
    unit_type = Column(String(50), nullable=True) # lighting, hvac, server
    
    area_sqm = Column(Float, nullable=True)
    is_critical = Column(Boolean, default=False)
    
    # Consumo
    avg_daily_consumption = Column(Float, default=0.0) # Antes avg_daily_kwh
    peak_hours = Column(String(100), nullable=True)
    
    status = Column(Boolean, default=True) # Activo/Inactivo
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relación
    campus = relationship("CampusProfile", back_populates="assets")

class ConsumptionRecord(Base):
    """
    Registro histórico de consumo.
    Mapeado a 'consumption_records'.
    """
    __tablename__ = "consumption_records"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campuses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    reading_value = Column(Float, nullable=False)
    reading_date = Column(DateTime(timezone=True), server_default=func.now())
    
    resource_type = Column(String(20), default="electricity") # electricity, water, gas
    source = Column(String(50), nullable=True) # manual, sensor_iot
    
    # Relaciones
    campus = relationship("CampusProfile", back_populates="consumption_records")
    user = relationship("User", back_populates="consumption_readings")

    __table_args__ = (
        CheckConstraint('reading_value >= 0', name='check_pos_reading'),
    )
