from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Campus(Base):
    __tablename__ = "campuses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(100), nullable=False) # Tunja, Duitama, Sogamoso, Chiquinquirá
    location_city = Column(String(100))
    
    # Campus Metrics
    population_students = Column(Integer, default=0)
    population_staff = Column(Integer, default=0)
    total_area_sqm = Column(Float)
    
    primary_usage = Column(String(100)) # e.g., "Mixed", "Research", "Administrative"
    
    # Baseline & Targets
    baseline_energy_kwh = Column(Float) # Daily average baseline
    target_reduction_percent = Column(Float, default=5.0) # Target reduction %
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="campuses")
    infrastructure = relationship("Infrastructure", back_populates="campus", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('population_students >= 0', name='check_pos_students'),
    )

class Infrastructure(Base):
    """Represents a building, lab, or specific zone within a campus."""
    __tablename__ = "infrastructure_units"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campuses.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(100), nullable=False) # e.g., "Edificio Central", "Laboratorios Ingeniería"
    unit_type = Column(String(50)) # building, lab, canteen, office, auditorium
    
    area_sqm = Column(Float)
    is_critical = Column(Boolean, default=False) # e.g., data center or hospital wing
    
    # Energy Profile
    avg_daily_consumption = Column(Float, default=0.0) # kWh
    peak_hours = Column(String(100)) # e.g., "08:00-18:00"
    
    status = Column(Boolean, default=True) # Operational?
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    campus = relationship("Campus", back_populates="infrastructure")

class ConsumptionRecord(Base):
    """Historical consumption data for a campus (or unit level if expanded)."""
    __tablename__ = "consumption_records"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campuses.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    reading_value = Column(Float, nullable=False) # kWh or m3
    reading_date = Column(DateTime(timezone=True), server_default=func.now())
    resource_type = Column(String(20), default="electricity") # electricity, water, gas
    source = Column(String(50), default="sensor") 
    
    campus = relationship("Campus")
    user = relationship("User", back_populates="consumption_records")

    __table_args__ = (
        CheckConstraint('reading_value >= 0', name='check_pos_reading'),
        Index('ix_consumption_campus_date', 'campus_id', 'reading_date'),
    )
