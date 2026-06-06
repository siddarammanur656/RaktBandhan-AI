from pydantic import BaseModel

class AdminDashboardResponse(BaseModel):
    pass # No incoming request schema needed for GET
