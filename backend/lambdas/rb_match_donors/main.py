from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
import json
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

SAGEMAKER_ENDPOINT_NAME = os.getenv("SAGEMAKER_ENDPOINT_NAME", "raktbandhan-donor-prediction-endpoint")

def get_ml_prediction(donor_features: dict) -> float:
    """
    Calls the Amazon SageMaker Serverless Endpoint to get the ML prediction score.
    """
    try:
        sagemaker = boto3.client('sagemaker-runtime', region_name=REGION)
        # In a real scenario, convert dict to CSV or JSON as expected by XGBoost
        payload = json.dumps([donor_features])
        
        # Removed local mock logic to strictly rely on real algorithms if endpoint fails
            
        response = sagemaker.invoke_endpoint(
            EndpointName=SAGEMAKER_ENDPOINT_NAME,
            ContentType='application/json',
            Body=payload
        )
        result = json.loads(response['Body'].read().decode())
        # Assuming model returns probabilities like [[0.1, 0.9]]
        return float(result[0][1])
    except Exception as e:
        print(f"SageMaker invocation failed: {e}")
        return 0.0

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
        
        # 5. Calculate ML Prediction Score using SageMaker
        feature_dict = {
            "blood_group": donor_blood,
            "gender": donor.get("gender", "Unknown"),
            "latitude": float(lat),
            "longitude": float(lng),
            "distance_km": distance,
            "donor_type": donor.get("donor_type", "Standard"),
            "eligibility_status": "Eligible" if is_eligible else "Ineligible",
            "user_donation_active_status": donor.get("status", "active")
        }
        ml_prediction_score = get_ml_prediction(feature_dict)
                
        matched_donors.append({
            "user_id": donor["user_id"],
            "name": donor.get("name", "Unknown"),
            "email": donor.get("email", ""),
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
