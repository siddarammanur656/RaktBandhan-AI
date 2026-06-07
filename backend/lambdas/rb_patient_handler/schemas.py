from pydantic import BaseModel
from typing import Optional

class PatientProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    blood_group: str
    date_of_birth: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_text: Optional[str] = None
    transfusion_frequency_days: int
    guardian_name: str
    guardian_phone: str
