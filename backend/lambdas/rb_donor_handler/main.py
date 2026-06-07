from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime, timedelta
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key
import os
import math

from decimal import Decimal
from dotenv import load_dotenv

from .schemas import ProfileUpdateRequest, LocationUpdateRequest, DeclineRequest

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

from location_service import reverse_geocode, forward_geocode

@app.post("/api/donors/profile")
def update_profile(request: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    lat, lng = request.latitude, request.longitude
    city, area = "Unknown", "Unknown"
    
    if request.address_text and (not lat or not lng):
        lat, lng = forward_geocode(request.address_text)
        
    if lat and lng:
        city, area = reverse_geocode(lat, lng)
    
    update_expr_parts = [
        "blood_group=:b", "gender=:g", "date_of_birth=:d", "latitude=:lat",
        "longitude=:lng", "donor_type=:dt", "city=:c", "area=:a",
        "reliability_score=if_not_exists(reliability_score, :rs)",
        "next_eligible_date=if_not_exists(next_eligible_date, :ned)"
    ]
    expr_vals = {
        ":b": request.blood_group,
        ":g": request.gender,
        ":d": request.date_of_birth,
        ":lat": Decimal(str(lat)) if lat else None,
        ":lng": Decimal(str(lng)) if lng else None,
        ":dt": request.donor_type,
        ":c": city,
        ":a": area,
        ":rs": Decimal(str(50)),
        ":ned": (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d")
    }
    
    expr_names = {}
    if request.name:
        update_expr_parts.append("#n=:n")
        expr_vals[":n"] = request.name
        expr_names["#n"] = "name"
    if request.email:
        update_expr_parts.append("email=:e")
        expr_vals[":e"] = request.email
    if request.phone:
        update_expr_parts.append("phone=:p")
        expr_vals[":p"] = request.phone

    update_expr = "set " + ", ".join(update_expr_parts)
    update_kwargs = {
        "Key": {"user_id": current_user["user_id"]},
        "UpdateExpression": update_expr,
        "ExpressionAttributeValues": expr_vals
    }
    if expr_names:
        update_kwargs["ExpressionAttributeNames"] = expr_names

    users_table.update_item(**update_kwargs)
    
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
    lat, lng = request.latitude, request.longitude
    city, area = "Unknown", "Unknown"
    
    if request.address_text and (not lat or not lng):
        lat, lng = forward_geocode(request.address_text)
        
    if lat and lng:
        city, area = reverse_geocode(lat, lng)
    
    users_table.update_item(
        Key={"user_id": current_user["user_id"]},
        UpdateExpression="set latitude=:lat, longitude=:lng, city=:c, area=:a",
        ExpressionAttributeValues={
            ":lat": Decimal(str(lat)) if lat else None,
            ":lng": Decimal(str(lng)) if lng else None,
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

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

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

    # Fetch pending requests assigned/contacted to this donor
    pending_requests = []
    try:
        # For demo purposes we can scan for matching status
        req_resp = requests_table.scan(
            FilterExpression=Key("status").eq("matching")
        )
        for req in req_resp.get("Items", []):
            contacted = req.get("donors_contacted", [])
            # Only show if they were contacted by AI or if they match the city (fallback for demo)
            if current_user["user_id"] in contacted or (req.get("city") == current_user.get("city") and req.get("blood_group") == current_user.get("blood_group")):
                # Fetch patient name
                p_name = "Unknown"
                if req.get("patient_id"):
                    p_resp = users_table.get_item(Key={"user_id": req["patient_id"]})
                    if p_resp.get("Item"):
                        p_name = p_resp["Item"].get("name", "Unknown")
                        
                dist = "N/A"
                if req.get("latitude") and req.get("longitude") and current_user.get("latitude") and current_user.get("longitude"):
                    try:
                        dist = round(calculate_haversine_distance(
                            float(current_user["latitude"]), float(current_user["longitude"]),
                            float(req["latitude"]), float(req["longitude"])
                        ), 1)
                    except:
                        pass

                pending_requests.append({
                    "request_id": req["request_id"],
                    "patient_name": p_name,
                    "blood_group_needed": req["blood_group"],
                    "distance_km": dist,
                    "urgency": req.get("urgency", "Normal"),
                    "hospital": req.get("city", "Unknown Hospital")
                })
    except Exception as e:
        print("Error fetching donor requests:", e)
    
    # Mock recent donations
    # Real logic would query rb_donations GSI donor-index
    recent_donations = []
    
    response = donations_table.query(
        IndexName="donor-index",
        KeyConditionExpression=Key("donor_id").eq(current_user["user_id"])
    )
    for item in response.get("Items", []):
        p_name = "Anonymous Patient"
        if item.get("patient_id"):
            p_resp = users_table.get_item(Key={"user_id": item["patient_id"]})
            if p_resp.get("Item"):
                p_name = p_resp["Item"].get("name", "Anonymous Patient")
                
        recent_donations.append({
            "donation_id": item["donation_id"],
            "date": item.get("donation_date"),
            "patient_name": p_name,
            "location": item.get("location")
        })

    score = int(current_user.get("reliability_score", 0))
    if score >= 70:
        calculated_tier = "Gold"
    elif score >= 30:
        calculated_tier = "Silver"
    else:
        calculated_tier = "Bronze"

    return {
        "success": True,
        "data": {
            "donor": {
                "name": current_user.get("name", "Unknown"),
                "blood_group": current_user.get("blood_group", "Unknown"),
                "reliability_score": score,
                "tier": calculated_tier,
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
    
    # Fetch real request details
    req_resp = requests_table.get_item(Key={"request_id": request_id})
    req = req_resp.get("Item", {})
    
    p_contact = "N/A"
    if req.get("patient_id"):
        p_resp = users_table.get_item(Key={"user_id": req["patient_id"]})
        if p_resp.get("Item"):
            p_contact = p_resp["Item"].get("phone", p_resp["Item"].get("email", "N/A"))
            
    apt_date = req.get("required_date", (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z")
    
    return {
        "success": True,
        "data": {
            "request_id": request_id,
            "status": "accepted",
            "appointment_date": apt_date,
            "location": req.get("city", "Unknown Hospital"),
            "patient_contact": p_contact
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
