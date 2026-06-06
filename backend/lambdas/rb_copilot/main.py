from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from jose import jwt, JWTError

app = FastAPI(title="RaktBandhan AI - Admin Copilot")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class CopilotQuery(BaseModel):
    query: str

def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"error": "Missing token"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, "raktbandhan-local-secret-key", algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail={"error": "Admin access required"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"error": "Invalid token"})
    return payload

@app.post("/api/admin/copilot")
def copilot_query(request: CopilotQuery, current_admin: dict = Depends(get_current_admin)):
    # Mocked Bedrock Sonnet Response
    return {
        "success": True,
        "data": {
            "query_interpretation": f"Understood query: {request.query}",
            "result_count": 23,
            "results": [
                {
                    "user_id": "u_111",
                    "name": "Suresh M.",
                    "last_contact_date": "2024-05-12",
                    "reason_inactive": "Not donated in last 1 year",
                    "suggested_action": "Send re-engagement email"
                }
            ],
            "suggested_followup": "Would you like to launch a re-engagement campaign?"
        }
    }

handler = Mangum(app)
