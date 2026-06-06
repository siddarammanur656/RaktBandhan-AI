import json
import boto3
import os

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")
SAGEMAKER_ENDPOINT_NAME = os.getenv("SAGEMAKER_ENDPOINT_NAME", "raktbandhan-donor-prediction-endpoint")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)
sagemaker = boto3.client('sagemaker-runtime', region_name=REGION)

def handler(event, context):
    print("ChurnPredictor Event:", json.dumps(event))
    
    # 1. Fetch all donors
    try:
        response = users_table.scan(
            FilterExpression="#r = :role",
            ExpressionAttributeNames={"#r": "role"},
            ExpressionAttributeValues={":role": "donor"}
        )
        donors = response.get("Items", [])
    except Exception as e:
        print("Failed to fetch donors:", e)
        return {"success": False, "error": str(e)}
        
    flagged_count = 0
    
    # 2. Check each donor's churn probability
    for donor in donors:
        # Construct feature dict
        # In a real model, this would be numeric vectors
        feature_dict = {
            "blood_group": donor.get("blood_group", "O+"),
            "gender": donor.get("gender", "Unknown"),
            "latitude": float(donor.get("latitude", 0)),
            "longitude": float(donor.get("longitude", 0)),
            "distance_km": 10.0, # dummy for churn
            "donor_type": donor.get("donor_type", "Standard"),
            "eligibility_status": "Eligible",
            "user_donation_active_status": donor.get("status", "active")
        }
        
        score = 0.0
        try:
            if SAGEMAKER_ENDPOINT_NAME == "raktbandhan-donor-prediction-endpoint":
                # Mock logic
                score = 0.1 if donor.get("status") == "active" else 0.9
            else:
                payload = json.dumps([feature_dict])
                s_resp = sagemaker.invoke_endpoint(
                    EndpointName=SAGEMAKER_ENDPOINT_NAME,
                    ContentType='application/json',
                    Body=payload
                )
                result = json.loads(s_resp['Body'].read().decode())
                score = float(result[0][1]) # Assume index 1 is probability of churn
        except Exception as e:
            print("SageMaker error:", e)
            continue
            
        # If churn probability > 80%, flag them
        if score > 0.8:
            users_table.update_item(
                Key={"user_id": donor["user_id"]},
                UpdateExpression="SET churn_risk = :r, ml_prediction_score = :s",
                ExpressionAttributeValues={
                    ":r": True,
                    ":s": str(round(score, 4))
                }
            )
            flagged_count += 1
            print(f"Flagged donor {donor.get('user_id')} for churn risk.")
            
    return {
        "success": True,
        "donors_scanned": len(donors),
        "flagged_count": flagged_count
    }
