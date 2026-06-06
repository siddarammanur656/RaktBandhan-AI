from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
import pandas as pd
import joblib
import traceback
from dotenv import load_dotenv

from .schemas import MatchRequest
from .utils import calculate_haversine_distance, is_blood_compatible, calculate_reliability_score, get_tier

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Match Donors Handler")

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

MODEL_BUCKET = os.getenv("MODEL_S3_BUCKET")
MODEL_KEY = os.getenv("MODEL_S3_KEY", "donor_prediction_model.pkl")
LOCAL_MODEL_PATH = os.path.join(os.path.dirname(__file__), "donor_prediction_model.pkl")

ml_pipeline = None

def load_ml_model():
    global ml_pipeline
    if ml_pipeline is not None:
        return
        
    try:
        if MODEL_BUCKET:
            print(f"Loading ML model from S3 bucket {MODEL_BUCKET}...")
            s3 = boto3.client('s3', region_name=REGION)
            tmp_path = "/tmp/donor_prediction_model.pkl"
            s3.download_file(MODEL_BUCKET, MODEL_KEY, tmp_path)
            ml_pipeline = joblib.load(tmp_path)
            print("Model loaded from S3 successfully.")
        else:
            print(f"Loading ML model from local path {LOCAL_MODEL_PATH}...")
            if os.path.exists(LOCAL_MODEL_PATH):
                ml_pipeline = joblib.load(LOCAL_MODEL_PATH)
                print("Model loaded locally successfully.")
            else:
                print("Model file not found locally.")
    except Exception as e:
        print(f"Failed to load ML model: {e}")
        traceback.print_exc()

# Load model during cold start
load_ml_model()

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing token", "code": "UNAUTHORIZED"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=403, detail={"success": False, "error": "Access denied", "code": "FORBIDDEN"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
    return {"user_id": user_id}

@app.post("/api/match/find-donors")
def find_donors(payload: MatchRequest, current_user: dict = Depends(get_current_user)):
    # In a real production system, you'd use GeoSpatial queries or ES.
    # For this hackathon backend, we fetch all active donors and filter in-memory.
    response = users_table.scan(
        FilterExpression=Attr("role").eq("donor") & Attr("status").eq("active")
    )
    all_donors = response.get("Items", [])
    
    # Handle pagination if necessary (for large local datasets)
    while 'LastEvaluatedKey' in response:
        response = users_table.scan(
            FilterExpression=Attr("role").eq("donor") & Attr("status").eq("active"),
            ExclusiveStartKey=response['LastEvaluatedKey']
        )
        all_donors.extend(response.get("Items", []))

    matched_donors = []
    
    for donor in all_donors:
        donor_blood = donor.get("blood_group")
        lat = donor.get("latitude")
        lng = donor.get("longitude")
        
        # Skip if missing essential data
        if not donor_blood or lat is None or lng is None:
            continue
            
        # 1. Check Blood Compatibility
        if not is_blood_compatible(donor_blood=donor_blood, patient_blood=payload.blood_group):
            continue
            
        # 2. Check Distance
        try:
            distance = calculate_haversine_distance(
                lat1=payload.latitude, 
                lon1=payload.longitude, 
                lat2=float(lat), 
                lon2=float(lng)
            )
        except ValueError:
            continue
            
        if distance > payload.max_distance_km:
            continue
            
        # 3. Check Eligibility (simplified for hackathon: just ensuring date passed)
        next_eligible = donor.get("next_eligible_date")
        is_eligible = True
        if next_eligible:
            try:
                next_date = datetime.strptime(next_eligible, "%Y-%m-%d")
                if next_date > datetime.utcnow():
                    is_eligible = False
            except ValueError:
                pass
                
        # 4. Calculate final Reliability Score
        base = int(donor.get("reliability_score", 50))
        tot_donations = int(donor.get("total_donations", 0))
        last_donation = donor.get("last_donation_date") # Might be None
        
        final_score = calculate_reliability_score(base, tot_donations, last_donation)
        tier = get_tier(final_score)
        
        # 5. Calculate ML Prediction Score
        ml_prediction_score = 0.0
        if ml_pipeline:
            try:
                feature_dict = {
                    "blood_group": donor_blood,
                    "gender": donor.get("gender", "Unknown"),
                    "latitude": float(lat),
                    "longitude": float(lng),
                    "donor_type": donor.get("donor_type", "Standard"),
                    "eligibility_status": donor.get("eligibility_status", "Eligible"),
                    "user_donation_active_status": donor.get("user_donation_active_status", "Active")
                }
                df_features = pd.DataFrame([feature_dict])
                prob = ml_pipeline.predict_proba(df_features)
                ml_prediction_score = float(prob[0][1]) # Probability of class 1
            except Exception as e:
                print(f"ML Prediction failed for donor {donor.get('user_id')}: {e}")
                
        matched_donors.append({
            "user_id": donor["user_id"],
            "name": donor.get("name", "Unknown"),
            "blood_group": donor_blood,
            "distance_km": round(distance, 1),
            "reliability_score": final_score,
            "tier": tier,
            "city": donor.get("city", "Unknown"),
            "area": donor.get("area", "Unknown"),
            "last_donation_date": last_donation,
            "is_eligible": is_eligible,
            "ml_prediction_score": round(ml_prediction_score, 4)
        })
        
    # Sort criteria: 
    # Primary: is_eligible (True first)
    # Secondary: ml_prediction_score (descending - highest probability first)
    # Tertiary: distance_km (ascending - closest first)
    # Quaternary: reliability_score (descending)
    matched_donors.sort(key=lambda x: (not x["is_eligible"], -x["ml_prediction_score"], x["distance_km"], -x["reliability_score"]))
    
    # Apply Limit
    final_results = matched_donors[:payload.limit]
    
    return {
        "success": True,
        "data": {
            "total_found": len(matched_donors),
            "donors": final_results
        }
    }

# Lambda handler
handler = Mangum(app)
