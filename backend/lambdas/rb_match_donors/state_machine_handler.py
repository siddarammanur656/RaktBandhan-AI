import json
import os
import boto3
from boto3.dynamodb.conditions import Attr

# Setup DynamoDB
REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)

def handler(event, context):
    print("MatchDonors Event:", json.dumps(event))
    
    request_id = event.get('request_id')
    patient_id = event.get('patient_id')
    batch_index = event.get('batch_index', 0)
    global_pool_fallback = event.get('global_pool_fallback', False)
    
    # 1. Fetch the request to know what blood group is needed
    try:
        req_resp = requests_table.get_item(Key={"request_id": request_id})
        request_item = req_resp.get("Item")
        if not request_item:
            raise Exception("Request not found")
    except Exception as e:
        print("Failed to fetch request:", e)
        return {"success": False, "error": str(e)}
        
    blood_group = request_item.get("blood_group", "O+")
    patient_name = request_item.get("patient_name", "A Patient")
    location = request_item.get("location", "Hospital")
    
    # 2. Match Donors (Simplistic hackathon logic)
    # We fetch donors with matching blood group
    response = users_table.scan(
        FilterExpression=Attr("role").eq("donor") & Attr("status").eq("active") & Attr("blood_group").eq(blood_group)
    )
    all_donors = response.get("Items", [])
    
    # Sort them by some arbitrary reliability or distance (mocked here)
    # For Thalassemia round-robin, we normally pick a specific one. Here we just pick based on batch_index.
    batch_size = 5
    start_idx = batch_index * batch_size
    end_idx = start_idx + batch_size
    
    if start_idx >= len(all_donors):
        # We exhausted all donors
        return {
            "success": False,
            "exhausted": True,
            "matched_donors": []
        }
        
    selected_donors = all_donors[start_idx:end_idx]
    
    # Format the output for the next Step (SendOutreach)
    formatted_donors = []
    for d in selected_donors:
        formatted_donors.append({
            "donor_id": d.get("user_id"),
            "donor_name": d.get("name", "Unknown"),
            "donor_email": d.get("email", "test@example.com"),
            "distance_km": 5.0  # mocked
        })
        
    return {
        "success": True,
        "request_id": request_id,
        "patient_name": patient_name,
        "hospital_location": location,
        "blood_group": blood_group,
        "batch_index": batch_index,
        "matched_donors": formatted_donors
    }
