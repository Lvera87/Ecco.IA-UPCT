from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# --- Infrastructure Schemas ---
class InfrastructureBase(BaseModel):
    name: str
    unit_type: Optional[str] = "classroom"
    area_sqm: Optional[float] = 0.0
    is_critical: Optional[bool] = False
    avg_daily_consumption: Optional[float] = 0.0
    status: Optional[bool] = True

class InfrastructureCreate(InfrastructureBase):
    pass

class Infrastructure(InfrastructureBase):
    id: int
    campus_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Consumption Schemas ---
class ConsumptionRecordBase(BaseModel):
    reading_value: float
    resource_type: Optional[str] = "electricity"
    source: Optional[str] = "sensor"

class ConsumptionRecordCreate(ConsumptionRecordBase):
    pass

class ConsumptionRecord(ConsumptionRecordBase):
    id: int
    campus_id: int
    reading_date: datetime

    class Config:
        from_attributes = True

# --- Campus Schemas ---
class CampusBase(BaseModel):
    name: str
    location_city: Optional[str] = None
    population_students: Optional[int] = 0
    population_staff: Optional[int] = 0
    total_area_sqm: Optional[float] = 0.0
    primary_usage: Optional[str] = "Mixed"
    baseline_energy_kwh: Optional[float] = 0.0
    target_reduction_percent: Optional[float] = 5.0

class CampusCreate(CampusBase):
    pass

class Campus(CampusBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    infrastructure: List[Infrastructure] = []

    class Config:
        from_attributes = True
