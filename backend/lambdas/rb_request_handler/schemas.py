from pydantic import BaseModel
from typing import Optional

class CreateRequest(BaseModel):
    patient_id: str
    blood_group: str
    quantity_units: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_text: Optional[str] = None
    urgency: str
    required_by_date: str
    notes: Optional[str] = None
