import boto3
import os
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
SCHEDULES_TABLE = os.getenv("SCHEDULES_TABLE", "rb_schedules")
REQUESTS_TABLE = os.getenv("REQUESTS_TABLE", "rb_requests")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

schedules_table = dynamodb.Table(SCHEDULES_TABLE)
requests_table = dynamodb.Table(REQUESTS_TABLE)

def lambda_handler(event, context):
    print("Running Schedule Manager (CRON)...")
    
    # In a real app we'd query by an index, or scan for next_occurrence <= today
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    response = schedules_table.scan()
    schedules = response.get('Items', [])
    
    created_count = 0
    for sched in schedules:
        if sched.get('status') == 'active' and sched.get('next_occurrence', '') <= today:
            # Create a new blood request
            patient_id = sched['patient_id']
            req_id = f"req_auto_{uuid.uuid4().hex[:8]}"
            
            requests_table.put_item(Item={
                "request_id": req_id,
                "patient_id": patient_id,
                "status": "matching",
                "blood_group": "Unknown (Fetch from User)",
                "created_at": datetime.utcnow().isoformat() + "Z",
                "source": "automated_schedule",
                "schedule_id": sched['schedule_id']
            })
            
            # Update schedule to next occurrence
            freq = int(sched.get('frequency_days', 30))
            next_occ = (datetime.utcnow() + timedelta(days=freq)).strftime("%Y-%m-%d")
            
            schedules_table.update_item(
                Key={"schedule_id": sched['schedule_id']},
                UpdateExpression="set next_occurrence = :n, last_triggered = :l",
                ExpressionAttributeValues={
                    ":n": next_occ,
                    ":l": datetime.utcnow().isoformat() + "Z"
                }
            )
            created_count += 1
            print(f"Created auto-request {req_id} for patient {patient_id}. Next occurrence: {next_occ}")
            
    return {
        "success": True,
        "message": f"Processed {created_count} schedules."
    }

if __name__ == "__main__":
    lambda_handler({}, None)
