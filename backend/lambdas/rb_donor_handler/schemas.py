from pydantic import BaseModel
from typing import Optional

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    blood_group: str
    gender: str
    date_of_birth: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_text: Optional[str] = None
    donor_type: str

class LocationUpdateRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_text: Optional[str] = None

class DeclineRequest(BaseModel):
    reason: str
