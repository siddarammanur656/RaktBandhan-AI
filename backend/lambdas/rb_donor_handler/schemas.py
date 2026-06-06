from pydantic import BaseModel
from typing import Optional

class ProfileUpdateRequest(BaseModel):
    blood_group: str
    gender: str
    date_of_birth: str
    latitude: float
    longitude: float
    donor_type: str

class LocationUpdateRequest(BaseModel):
    latitude: float
    longitude: float

class DeclineRequest(BaseModel):
    reason: str
