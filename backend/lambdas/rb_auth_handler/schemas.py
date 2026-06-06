from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    phone: str
    blood_group: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    role: str
    name: Optional[str] = None
    phone: Optional[str] = None

class TokenResponseData(BaseModel):
    token: str
    user: UserResponse

class SuccessResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: str
