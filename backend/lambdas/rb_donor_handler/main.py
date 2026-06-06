from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime, timedelta
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key
import os
import reverse_geocoder as rg
from decimal import Decimal
from dotenv import load_dotenv

from schemas import ProfileUpdateRequest, LocationUpdateRequest, DeclineRequest

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Donor Handler")

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
DONATIONS_TABLE_NAME = os.getenv("DONATIONS_TABLE", "rb_donations")

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)
donations_table = dynamodb.Table(DONATIONS_TABLE_NAME)

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing token", "code": "UNAUTHORIZED"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if not user_id or role != "donor":
            raise HTTPException(status_code=403, detail={"success": False, "error": "Access denied", "code": "FORBIDDEN"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
        
    response = users_table.get_item(Key={"user_id": user_id})
    user = response.get("Item")
    if not user:
        raise HTTPException(status_code=404, detail={"success": False, "error": "User not found", "code": "NOT_FOUND"})
    return user

def geocode(lat: float, lng: float):
    coords = (lat, lng)
    results = rg.search(coords)
    if results:
        loc = results[0]
        city = loc.get('name', 'Unknown')
        area = loc.get('admin2', city)
        return city, area
    return "Unknown", "Unknown"

@app.post("/api/donors/profile")
def update_profile(request: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    city, area = geocode(request.latitude, request.longitude)
    
    users_table.update_item(
        Key={"user_id": current_user["user_id"]},
        UpdateExpression="set blood_group=:b, gender=:g, date_of_birth=:d, latitude=:lat, longitude=:lng, donor_type=:dt, city=:c, area=:a, reliability_score=:rs, next_eligible_date=:ned",
        ExpressionAttributeValues={
            ":b": request.blood_group,
            ":g": request.gender,
            ":d": request.date_of_birth,
            ":lat": Decimal(str(request.latitude)),
            ":lng": Decimal(str(request.longitude)),
            ":dt": request.donor_type,
            ":c": city,
            ":a": area,
            ":rs": Decimal(str(50)),
            ":ned": (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d")
        }
    )
    
    return {
        "success": True,
        "data": {
            "user_id": current_user["user_id"],
            "blood_group": request.blood_group,
            "city": city,
            "area": area,
            "reliability_score": 50,
            "next_eligible_date": (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d")
        }
    }

@app.put("/api/donors/location")
def update_location(request: LocationUpdateRequest, current_user: dict = Depends(get_current_user)):
    city, area = geocode(request.latitude, request.longitude)
    
    users_table.update_item(
        Key={"user_id": current_user["user_id"]},
        UpdateExpression="set latitude=:lat, longitude=:lng, city=:c, area=:a",
        ExpressionAttributeValues={
            ":lat": Decimal(str(request.latitude)),
            ":lng": Decimal(str(request.longitude)),
            ":c": city,
            ":a": area
        }
    )
    
    return {
        "success": True,
        "data": {
            "city": city,
            "area": area
        }
    }

@app.get("/api/donors/dashboard")
def get_dashboard(current_user: dict = Depends(get_current_user)):
    # Calculate days until eligible
    next_eligible_str = current_user.get("next_eligible_date")
    days_until_eligible = 0
    is_eligible_now = True
    if next_eligible_str:
        try:
            next_date = datetime.strptime(next_eligible_str, "%Y-%m-%d")
            delta = (next_date - datetime.utcnow()).days
            days_until_eligible = max(0, delta)
            is_eligible_now = days_until_eligible == 0
        except ValueError:
            pass

    # Mock pending requests assigned to donor
    # Real logic would query rb_requests where assigned_donor_id == current_user['user_id']
    pending_requests = []
    
    # Mock recent donations
    # Real logic would query rb_donations GSI donor-index
    recent_donations = []
    
    response = donations_table.query(
        IndexName="donor-index",
        KeyConditionExpression=Key("donor_id").eq(current_user["user_id"])
    )
    for item in response.get("Items", []):
        recent_donations.append({
            "donation_id": item["donation_id"],
            "date": item.get("donation_date"),
            "patient_name": "Patient", # Would need to join or store patient name
            "location": item.get("location")
        })

    return {
        "success": True,
        "data": {
            "donor": {
                "name": current_user.get("name", "Unknown"),
                "blood_group": current_user.get("blood_group", "Unknown"),
                "reliability_score": int(current_user.get("reliability_score", 0)),
                "tier": current_user.get("tier", "Bronze"),
                "total_donations": int(current_user.get("total_donations", 0)),
                "next_eligible_date": current_user.get("next_eligible_date"),
                "days_until_eligible": days_until_eligible,
                "is_eligible_now": is_eligible_now
            },
            "pending_requests": pending_requests,
            "recent_donations": recent_donations
        }
    }

@app.post("/api/donors/requests/{request_id}/accept")
def accept_request(request_id: str, current_user: dict = Depends(get_current_user)):
    # Update request status to donor_confirmed and set assigned_donor_id
    requests_table.update_item(
        Key={"request_id": request_id},
        UpdateExpression="set #st = :s, assigned_donor_id = :d, confirmed_at = :c",
        ExpressionAttributeNames={"#st": "status"},
        ExpressionAttributeValues={
            ":s": "donor_confirmed",
            ":d": current_user["user_id"],
            ":c": datetime.utcnow().isoformat() + "Z"
        }
    )
    
    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "status": "accepted",
            "appointment_date": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
            "location": "Hospital",
            "patient_contact": "+910000000000"
        },
        "message": "Thank you! Appointment confirmed."
    }

@app.post("/api/donors/requests/{request_id}/decline")
def decline_request(request_id: str, payload: DeclineRequest, current_user: dict = Depends(get_current_user)):
    # For now we just return success as it will trigger matching for another donor
    # Real logic might append donor_id to a declined_donors list or similar
    return {
        "success": True,
        "message": "Request declined. We'll find another donor."
    }

# Lambda handler
handler = Mangum(app)
