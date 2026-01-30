from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    """Schema para registro de administrador de infraestructura UPTC."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=120)
    user_type: str = "infrastructure" # fixed type
    
    # Campos de Sede Universitaria
    campus_name: str = Field(..., description="Nombre de la Sede (ej. Central)")
    city: str = Field(..., description="Ciudad de la Sede")
    total_area_sqm: float = Field(..., gt=0)
    student_population: int = Field(0, ge=0)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_type: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    user_type: str
