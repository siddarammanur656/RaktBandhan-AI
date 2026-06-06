from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from jose import jwt, JWTError
import boto3
import os
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Admin Handler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)

def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing token", "code": "UNAUTHORIZED"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if not user_id or role != "admin":
            raise HTTPException(status_code=403, detail={"success": False, "error": "Admin access required", "code": "FORBIDDEN"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
        
    return {"user_id": user_id, "role": role}

@app.get("/api/admin/dashboard")
def get_dashboard(current_admin: dict = Depends(get_current_admin)):
    
    # 1. Scan Users Table
    users_scan = users_table.scan()
    users = users_scan.get('Items', [])
    
    total_donors = 0
    active_donors = 0
    inactive_donors = 0
    tier_counts = {"Gold": 0, "Silver": 0, "Bronze": 0}
    blood_groups = defaultdict(int)
    
    for u in users:
        if u.get('role') == 'donor':
            total_donors += 1
            if u.get('status') == 'active':
                active_donors += 1
            else:
                inactive_donors += 1
                
            tier = u.get('tier', 'Bronze')
            if tier in tier_counts:
                tier_counts[tier] += 1
                
            bg = u.get('blood_group', 'Unknown')
            blood_groups[bg] += 1

    # 2. Scan Requests Table
    reqs_scan = requests_table.scan()
    requests = reqs_scan.get('Items', [])
    
    total_reqs = len(requests)
    fulfilled = sum(1 for r in requests if r.get('status') in ('donor_confirmed', 'completed'))
    escalations = sum(1 for r in requests if r.get('status') == 'escalated')
    active_outreach = sum(1 for r in requests if r.get('status') == 'matching')
    
    fulfillment_rate = round((fulfilled / total_reqs * 100), 1) if total_reqs > 0 else 0.0

    return {
        "success": True,
        "data": {
            "today_stats": {
                "total_requests": total_reqs,
                "auto_fulfilled": fulfilled,
                "auto_fulfillment_rate": fulfillment_rate,
                "escalations": escalations,
                "active_outreach": active_outreach
            },
            "donor_stats": {
                "total_donors": total_donors,
                "active_donors": active_donors,
                "inactive_donors": inactive_donors,
                "gold_tier": tier_counts["Gold"],
                "silver_tier": tier_counts["Silver"],
                "bronze_tier": tier_counts["Bronze"]
            },
            "blood_group_distribution": dict(blood_groups),
            "donors": [
                {
                    "id": d.get("user_id"),
                    "name": d.get("name", "Unknown"),
                    "bloodGroup": d.get("blood_group", "Unknown"),
                    "tier": d.get("tier", "Bronze"),
                    "score": int(d.get("reliability_score", 0)),
                    "lastDonation": d.get("last_donation_date", "None")
                } for d in users if d.get("role") == "donor"
            ][:10],
            "recent_escalations": [],
            "ai_insights": [
                "Local Mock: Request fulfillment rate is looking good.",
                "Local Mock: High demand for O Negative blood in Hyderabad."
            ]
        }
    }

# Lambda handler
handler = Mangum(app)
