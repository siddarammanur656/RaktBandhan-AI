from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from jose import jwt, JWTError

app = FastAPI(title="RaktBandhan AI - Failure Analyzer")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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

@app.get("/api/admin/insights/failures")
def get_failures(current_admin: dict = Depends(get_current_admin)):
    # Mocked Bedrock Analysis
    return {
        "success": True,
        "data": {
            "this_week": {
                "total_failures": 12,
                "by_reason": {
                    "no_donors_found": 5,
                    "all_declined": 4,
                    "donor_no_show": 3
                }
            },
            "ai_recommendations": [
                {
                    "issue": "5 requests for O- blood failed in Pune",
                    "recommendation": "Launch donor recruitment in Pune for O- group",
                    "priority": "high"
                },
                {
                    "issue": "Donor Rahul K. declined 3 times this month",
                    "recommendation": "Pause outreach for 2 weeks",
                    "priority": "medium"
                }
            ]
        }
    }

handler = Mangum(app)
