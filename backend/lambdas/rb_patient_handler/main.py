from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime, timedelta
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key
import os
import reverse_geocoder as rg
from decimal import Decimal
import uuid
from dotenv import load_dotenv

from .schemas import PatientProfileRequest

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Patient Handler")

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
SCHEDULES_TABLE_NAME = os.getenv("SCHEDULES_TABLE", "rb_schedules")
DONATIONS_TABLE_NAME = os.getenv("DONATIONS_TABLE", "rb_donations")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)
schedules_table = dynamodb.Table(SCHEDULES_TABLE_NAME)
donations_table = dynamodb.Table(DONATIONS_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing token", "code": "UNAUTHORIZED"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if not user_id or role != "patient":
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
        return city
    return "Unknown"

@app.post("/api/patients/profile")
def update_profile(request: PatientProfileRequest, current_user: dict = Depends(get_current_user)):
    city = geocode(request.latitude, request.longitude)
    
    # Update Patient profile
    users_table.update_item(
        Key={"user_id": current_user["user_id"]},
        UpdateExpression="set blood_group=:b, date_of_birth=:d, latitude=:lat, longitude=:lng, city=:c, transfusion_frequency_days=:f, guardian_name=:gn, guardian_phone=:gp",
        ExpressionAttributeValues={
            ":b": request.blood_group,
            ":d": request.date_of_birth,
            ":lat": Decimal(str(request.latitude)),
            ":lng": Decimal(str(request.longitude)),
            ":c": city,
            ":f": Decimal(str(request.transfusion_frequency_days)),
            ":gn": request.guardian_name,
            ":gp": request.guardian_phone
        }
    )
    
    # Calculate next transfusion date
    next_date = (datetime.utcnow() + timedelta(days=request.transfusion_frequency_days)).strftime("%Y-%m-%d")
    
    # Create Schedule
    schedule_id = f"sch_{uuid.uuid4().hex[:8]}"
    schedules_table.put_item(Item={
        "schedule_id": schedule_id,
        "patient_id": current_user["user_id"],
        "blood_group": request.blood_group,
        "frequency_days": Decimal(str(request.transfusion_frequency_days)),
        "start_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "next_transfusion_date": next_date,
        "donor_pool": [],
        "active_status": "true",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    })
    
    return {
        "success": True,
        "data": {
            "user_id": current_user["user_id"],
            "blood_group": request.blood_group,
            "city": city,
            "next_transfusion_date": next_date,
            "schedule_created": True
        }
    }

@app.get("/api/patients/dashboard")
def get_dashboard(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Get upcoming schedules from rb_schedules using patient-index
    schedule_resp = schedules_table.query(
        IndexName="patient-index",
        KeyConditionExpression=Key("patient_id").eq(user_id)
    )
    
    upcoming_schedule = []
    next_transfusion = None
    
    if schedule_resp.get("Items"):
        # Just grab the first schedule for this mock logic
        sch = schedule_resp["Items"][0]
        base_date_str = sch.get("next_transfusion_date")
        
        if base_date_str:
            try:
                base_date = datetime.strptime(base_date_str, "%Y-%m-%d")
                days_until = max(0, (base_date - datetime.utcnow()).days)
                
                next_transfusion = {
                    "date": base_date_str,
                    "donor_name": "Finding donor...",
                    "donor_blood_group": current_user.get("blood_group", "Unknown"),
                    "location": "Hospital",
                    "status": "scheduled",
                    "days_until": days_until
                }
                
                freq = int(sch.get("frequency_days", 21))
                upcoming_schedule.append({
                    "date": (base_date + timedelta(days=freq)).strftime("%Y-%m-%d"),
                    "status": "scheduled",
                    "donor_assigned": False
                })
                upcoming_schedule.append({
                    "date": (base_date + timedelta(days=freq*2)).strftime("%Y-%m-%d"),
                    "status": "scheduled",
                    "donor_assigned": False
                })
            except ValueError:
                pass

    # Get transfusion history from rb_donations using patient-index
    history_resp = donations_table.query(
        IndexName="patient-index",
        KeyConditionExpression=Key("patient_id").eq(user_id)
    )
    
    transfusion_history = []
    for item in history_resp.get("Items", []):
        transfusion_history.append({
            "date": item.get("donation_date"),
            "donor_name": "Donor (ID hidden)",
            "location": item.get("location", "Unknown Hospital")
        })
        
    # Calculate age
    age = 0
    dob = current_user.get("date_of_birth")
    if dob:
        try:
            birth_year = int(dob.split("-")[0])
            age = datetime.utcnow().year - birth_year
        except:
            pass

    return {
        "success": True,
        "data": {
            "patient": {
                "name": current_user.get("name", "Unknown"),
                "age": age,
                "blood_group": current_user.get("blood_group", "Unknown")
            },
            "next_transfusion": next_transfusion or {
                "date": "Not scheduled",
                "status": "none",
                "days_until": 0
            },
            "upcoming_schedule": upcoming_schedule,
            "transfusion_history": transfusion_history
        }
    }

# Lambda handler
handler = Mangum(app)
