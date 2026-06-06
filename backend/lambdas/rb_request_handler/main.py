from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key
import os
import reverse_geocoder as rg
from decimal import Decimal
import uuid
from dotenv import load_dotenv

from .schemas import CreateRequest

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Request Handler")

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

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing token", "code": "UNAUTHORIZED"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if not user_id:
            raise HTTPException(status_code=403, detail={"success": False, "error": "Access denied", "code": "FORBIDDEN"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
        
    return {"user_id": user_id, "role": role}

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail={"success": False, "error": "Admin access required", "code": "FORBIDDEN"})
    return current_user

def geocode(lat: float, lng: float):
    coords = (lat, lng)
    results = rg.search(coords)
    if results:
        loc = results[0]
        city = loc.get('name', 'Unknown')
        return city
    return "Unknown"

@app.post("/api/requests", status_code=201)
def create_request(payload: CreateRequest, current_user: dict = Depends(get_current_user)):
    city = geocode(payload.latitude, payload.longitude)
    
    request_id = f"req_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    new_req = {
        "request_id": request_id,
        "patient_id": payload.patient_id,
        "blood_group": payload.blood_group,
        "quantity_units": Decimal(str(payload.quantity_units)),
        "latitude": Decimal(str(payload.latitude)),
        "longitude": Decimal(str(payload.longitude)),
        "city": city,
        "urgency": payload.urgency,
        "required_by_date": payload.required_by_date,
        "status": "matching",
        "donors_contacted": [],
        "donors_accepted": [],
        "assigned_donor_id": None,
        "notes": payload.notes,
        "created_at": now_iso
    }
    
    requests_table.put_item(Item=new_req)
    
    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "status": "matching",
            "workflow_started": True
        },
        "message": "Request created. Finding donors..."
    }

@app.get("/api/requests/{request_id}")
def get_request(request_id: str):
    response = requests_table.get_item(Key={"request_id": request_id})
    req = response.get("Item")
    
    if not req:
        raise HTTPException(status_code=404, detail={"success": False, "error": "Request not found", "code": "NOT_FOUND"})
        
    patient_name = "Unknown"
    if req.get("patient_id"):
        p_resp = users_table.get_item(Key={"user_id": req["patient_id"]})
        if p_resp.get("Item"):
            patient_name = p_resp["Item"].get("name", "Unknown")
            
    assigned_donor = None
    if req.get("assigned_donor_id"):
        d_resp = users_table.get_item(Key={"user_id": req["assigned_donor_id"]})
        if d_resp.get("Item"):
            d = d_resp["Item"]
            assigned_donor = {
                "name": d.get("name", "Unknown"),
                "phone": d.get("phone", ""),
                "reliability_score": int(d.get("reliability_score", 0))
            }
            
    return {
        "success": True,
        "data": {
            "request_id": req["request_id"],
            "status": req["status"],
            "blood_group": req["blood_group"],
            "patient_name": patient_name,
            "donors_contacted": len(req.get("donors_contacted", [])),
            "donors_accepted": len(req.get("donors_accepted", [])),
            "assigned_donor": assigned_donor,
            "created_at": req["created_at"],
            "confirmed_at": req.get("confirmed_at")
        }
    }

@app.get("/api/requests")
def list_requests(status: str = Query(None), limit: int = Query(50), admin_user: dict = Depends(get_admin_user)):
    if status:
        response = requests_table.query(
            IndexName="status-index",
            KeyConditionExpression=Key("status").eq(status),
            Limit=limit
        )
        items = response.get("Items", [])
    else:
        # Scan if no status is provided
        response = requests_table.scan(Limit=limit)
        items = response.get("Items", [])
        
    # Enrich with patient_name
    requests_out = []
    # Fetching names individually in a loop (fine for local/small scale)
    for req in items:
        p_name = "Unknown"
        if req.get("patient_id"):
            p_resp = users_table.get_item(Key={"user_id": req["patient_id"]})
            if p_resp.get("Item"):
                p_name = p_resp["Item"].get("name", "Unknown")
                
        requests_out.append({
            "request_id": req["request_id"],
            "patient_name": p_name,
            "blood_group": req.get("blood_group", "Unknown"),
            "status": req["status"],
            "city": req.get("city", "Unknown"),
            "created_at": req.get("created_at", "")
        })
        
    return {
        "success": True,
        "data": {
            "total": len(requests_out),
            "requests": requests_out
        }
    }

# Lambda handler
handler = Mangum(app)
