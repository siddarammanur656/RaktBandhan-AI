import os
import sys
import json
from datetime import datetime

# Setup local env if needed
os.environ["AWS_REGION"] = "us-east-1"
os.environ["FRONTEND_URL"] = "http://localhost:5173"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lambdas.rb_schedule_manager.main import handler as schedule_handler
from lambdas.rb_send_reminder.main import handler as reminder_handler

def seed_test_data():
    import boto3
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    schedules = dynamodb.Table("rb_schedules")
    users = dynamodb.Table("rb_users")
    
    print("\n--- [1] Seeding Test Patient and Schedule ---")
    users.put_item(Item={
        "user_id": "test_pat_1",
        "role": "patient",
        "status": "active",
        "name": "Test Patient",
        "blood_group": "A+"
    })
    
    # Create 8 dummy donors
    for i in range(8):
        users.put_item(Item={
            "user_id": f"test_donor_{i}",
            "role": "donor",
            "status": "active",
            "blood_group": "A+",
            "name": f"Donor {i}",
            "email": f"success@simulator.amazonses.com" # Use SES simulator to avoid real email bounce issues
        })
        
    # Create a schedule requiring transfusion 7 days from now
    import datetime
    next_week = (datetime.datetime.utcnow() + datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    
    schedules.put_item(Item={
        "schedule_id": "test_sch_1",
        "patient_id": "test_pat_1",
        "blood_group": "A+",
        "active_status": "true",
        "next_transfusion_date": next_week,
        "donor_circle": [],
        "current_donor_index": 0
    })
    print(f"Created schedule requiring transfusion on {next_week}")

def test_7_day_automation():
    print("\n--- [2] Triggering 7-Day Advance Automation (Schedule Manager) ---")
    result = schedule_handler({}, {})
    print("Result:", json.dumps(result, indent=2))
    
def test_1_day_fallback():
    print("\n--- [3] Simulating time lapse... modifying required_by_date to tomorrow ---")
    import boto3
    import datetime
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    requests_table = dynamodb.Table("rb_requests")
    
    # Find our created request
    response = requests_table.scan()
    for req in response.get("Items", []):
        if req.get("patient_id") == "test_pat_1":
            tomorrow = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
            requests_table.update_item(
                Key={"request_id": req["request_id"]},
                UpdateExpression="SET required_by_date = :t",
                ExpressionAttributeValues={":t": tomorrow}
            )
            print(f"Moved request {req['request_id']} date to {tomorrow}")
            break
            
    print("\n--- [4] Triggering 1-Day Urgent Fallback (Reminder Cron) ---")
    result = reminder_handler({}, {})
    print("Result:", json.dumps(result, indent=2))

if __name__ == "__main__":
    print("=== Thalassemia Round Robin Tester ===")
    try:
        seed_test_data()
        test_7_day_automation()
        test_1_day_fallback()
        print("\nTesting complete! Check AWS SES/Local output for logs.")
    except Exception as e:
        print("Error during test:", str(e))
        print("Note: Ensure you have mock credentials or Local DB running if not connected to AWS.")
