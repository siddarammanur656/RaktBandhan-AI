import json
import boto3
import os

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)

def handler(event, context):
    print("CheckResponses Event:", json.dumps(event))
    
    request_id = event.get("request_id")
    if not request_id:
        # Fallback if event shape is different depending on pass-through
        request_id = event.get("MatchResults", {}).get("request_id")
        
    if not request_id:
        return {"donor_accepted": False, "error": "No request_id provided"}
        
    try:
        req_resp = requests_table.get_item(Key={"request_id": request_id})
        request_item = req_resp.get("Item")
        
        if not request_item:
            return {"donor_accepted": False, "error": "Request not found"}
            
        status = request_item.get("status")
        assigned_donor = request_item.get("assigned_donor")
        
        if status in ["confirmed", "fulfilled"] and assigned_donor:
            print(f"Request {request_id} has been accepted by {assigned_donor}")
            return {"donor_accepted": True, "assigned_donor": assigned_donor}
        else:
            print(f"Request {request_id} is still pending.")
            return {"donor_accepted": False}
            
    except Exception as e:
        print("Failed to check responses:", e)
        return {"donor_accepted": False, "error": str(e)}
