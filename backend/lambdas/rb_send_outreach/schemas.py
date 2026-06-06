from pydantic import BaseModel

class OutreachRequest(BaseModel):
    request_id: str
    donor_id: str
    donor_name: str
    donor_email: str
    patient_name: str
    blood_group: str
    hospital_location: str
    distance_km: float
    required_by_date: str

class PatientNotificationRequest(BaseModel):
    request_id: str
    patient_name: str
    patient_email: str
    donor_name: str
    blood_group: str
    hospital_location: str
    confirmed_date: str
