from fastapi import FastAPI, Depends, HTTPException, Header, Query, BackgroundTasks
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key
import os
import httpx
import traceback

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

def trigger_matching_and_outreach(request_id: str, lat: float, lng: float, blood_group: str, city: str, required_by_date: str, token: str):
    try:
        base_url = os.getenv("FRONTEND_URL", "http://localhost:5173").replace("5173", "8000")
        headers = {"Authorization": f"Bearer {token}"}
        
        match_payload = {
            "latitude": lat if lat else 17.3850,
            "longitude": lng if lng else 78.4867,
            "blood_group": blood_group,
            "max_distance_km": 50,
            "limit": 3
        }
        
        print(f"Triggering AI Matching for {request_id}...")
        with httpx.Client() as client:
            resp = client.post(f"{base_url}/api/match/find-donors", json=match_payload, headers=headers, timeout=30.0)
            
            if resp.status_code != 200:
                print(f"Matching failed: {resp.text}")
                return
                
            match_data = resp.json()
            donors = match_data.get("data", {}).get("donors", [])
            
            print(f"Found {len(donors)} top donors. Triggering outreach...")
            
            contacted = []
            for d in donors:
                outreach_payload = {
                    "request_id": request_id,
                    "donor_id": d["user_id"],
                    "donor_name": d["name"],
                    "donor_email": f"{d['name'].split()[0].lower()}@mockdonor.com",
                    "patient_name": "Patient",
                    "blood_group": blood_group,
                    "hospital_location": city,
                    "distance_km": d.get("distance_km", 0),
                    "required_by_date": required_by_date
                }
                
                o_resp = client.post(f"{base_url}/api/outreach/send", json=outreach_payload, headers=headers, timeout=10.0)
                if o_resp.status_code == 200:
                    contacted.append(d["user_id"])
            
            if contacted:
                requests_table.update_item(
                    Key={"request_id": request_id},
                    UpdateExpression="SET donors_contacted = :c",
                    ExpressionAttributeValues={":c": contacted}
                )
                print(f"Outreach complete for {request_id}. Contacted: {contacted}")
                
    except Exception as e:
        print(f"Orchestration failed for {request_id}: {e}")
        traceback.print_exc()

from location_service import reverse_geocode, forward_geocode

@app.post("/api/requests", status_code=201)
def create_request(payload: CreateRequest, background_tasks: BackgroundTasks, authorization: str = Header(None), current_user: dict = Depends(get_current_user)):
    lat, lng = payload.latitude, payload.longitude
    city, area = "Unknown", "Unknown"
    
    if payload.address_text and (not lat or not lng):
        lat, lng = forward_geocode(payload.address_text)
        
    if lat and lng:
        city, area = reverse_geocode(lat, lng)
    
    request_id = f"req_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    new_req = {
        "request_id": request_id,
        "patient_id": payload.patient_id,
        "blood_group": payload.blood_group,
        "quantity_units": Decimal(str(payload.quantity_units)),
        "latitude": Decimal(str(lat)) if lat else None,
        "longitude": Decimal(str(lng)) if lng else None,
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
    
    # Trigger AI matching & emailing
    token = authorization.split(" ")[1] if authorization else ""
    background_tasks.add_task(trigger_matching_and_outreach, request_id, float(lat) if lat else 0.0, float(lng) if lng else 0.0, payload.blood_group, city, payload.required_by_date, token)
    
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

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

@app.get("/api/requests/accept")
def accept_request(request_id: str, donor_id: str):
    response = requests_table.get_item(Key={"request_id": request_id})
    req = response.get("Item")
    if not req:
        return RedirectResponse(url=f"{FRONTEND_URL}/thank-you?error=notfound")
        
    if req.get("status") in ["confirmed", "fulfilled"]:
        return RedirectResponse(url=f"{FRONTEND_URL}/thank-you?status=already_filled")
        
    # Update DB to assign donor
    requests_table.update_item(
        Key={"request_id": request_id},
        UpdateExpression="SET #s = :s, assigned_donor = :d, assigned_donor_id = :d, confirmed_at = :t",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":s": "confirmed",
            ":d": donor_id,
            ":t": datetime.utcnow().isoformat() + "Z"
        }
    )
    
    # Increment donor reliability score and total donations
    try:
        users_table.update_item(
            Key={"user_id": donor_id},
            UpdateExpression="SET reliability_score = if_not_exists(reliability_score, :start) + :inc, total_donations = if_not_exists(total_donations, :zero) + :one",
            ExpressionAttributeValues={
                ":start": Decimal("50"),
                ":inc": Decimal("10"),
                ":zero": Decimal("0"),
                ":one": Decimal("1")
            }
        )
    except Exception as e:
        print(f"Failed to update donor score: {e}")
    
    # In a real app, here we would trigger EventBridge Scheduler to send the reminder 1 day before
    
    return RedirectResponse(url=f"{FRONTEND_URL}/thank-you?status=success")

@app.get("/api/requests/decline")
def decline_request(request_id: str, donor_id: str):
    return RedirectResponse(url=f"{FRONTEND_URL}/thank-you?status=declined")

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
