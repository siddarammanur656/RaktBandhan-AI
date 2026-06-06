from pydantic import BaseModel

class PatientProfileRequest(BaseModel):
    blood_group: str
    date_of_birth: str
    latitude: float
    longitude: float
    transfusion_frequency_days: int
    guardian_name: str
    guardian_phone: str
