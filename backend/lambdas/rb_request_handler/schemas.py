from pydantic import BaseModel
from typing import Optional

class CreateRequest(BaseModel):
    patient_id: str
    blood_group: str
    quantity_units: int
    latitude: float
    longitude: float
    urgency: str
    required_by_date: str
    notes: Optional[str] = None
