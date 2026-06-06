from pydantic import BaseModel

class MatchRequest(BaseModel):
    blood_group: str
    latitude: float
    longitude: float
    max_distance_km: int = 50
    limit: int = 10
