import json
import boto3
import os
from datetime import datetime, timedelta

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
SCHEDULES_TABLE_NAME = os.getenv("SCHEDULES_TABLE", "rb_schedules")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

schedules_table = dynamodb.Table(SCHEDULES_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)

def handler(event, context):
    print("ScheduleManager Event:", json.dumps(event))
    
    # 1. Fetch all active schedules
    try:
        response = schedules_table.scan(
            FilterExpression="#s = :active",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":active": "active"}
        )
        schedules = response.get("Items", [])
    except Exception as e:
        print("Failed to fetch schedules:", e)
        return {"success": False, "error": str(e)}
        
    now = datetime.utcnow()
    created_count = 0
    
    for schedule in schedules:
        next_date_str = schedule.get("next_transfusion_date")
        if not next_date_str:
            continue
            
        try:
            next_date = datetime.strptime(next_date_str, "%Y-%m-%d")
        except ValueError:
            continue
            
        # If the transfusion is within the next 7 days, trigger the matching workflow
        days_until = (next_date - now).days
        if 0 <= days_until <= 7:
            # Check if we already created a request for this cycle
            last_request_date = schedule.get("last_request_created_date")
            if last_request_date and last_request_date == next_date_str:
                continue # Already handled
                
            # Create a new Request in DynamoDB
            import uuid
            request_id = f"req_thal_{uuid.uuid4().hex[:8]}"
            
            new_req = {
                "request_id": request_id,
                "patient_id": schedule.get("patient_id"),
                "blood_group": schedule.get("blood_group"),
                "quantity_units": 1,
                "city": schedule.get("city", "Unknown"),
                "urgency": "scheduled",
                "required_by_date": next_date_str,
                "status": "matching",
                "is_thalassemia": True,
                "created_at": now.isoformat() + "Z"
            }
            
            requests_table.put_item(Item=new_req)
            print(f"Created Thalassemia request {request_id} for patient {schedule.get('patient_id')}")
            
            # Update the schedule to note we created it
            schedules_table.update_item(
                Key={"schedule_id": schedule["schedule_id"]},
                UpdateExpression="SET last_request_created_date = :d",
                ExpressionAttributeValues={":d": next_date_str}
            )
            
            created_count += 1
            
    return {
        "success": True,
        "requests_created": created_count
    }
