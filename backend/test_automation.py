import json
import os
import sys

from dotenv import load_dotenv

# Load from .env file inside the backend folder
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Set up local environment fallbacks
if not os.getenv("AWS_REGION"):
    os.environ["AWS_REGION"] = "us-east-1"
if not os.getenv("FRONTEND_URL"):
    os.environ["FRONTEND_URL"] = "http://localhost:5173"

# Import lambda handlers directly to test logic without AWS deployment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lambdas.rb_match_donors.state_machine_handler import handler as match_handler
from lambdas.rb_send_outreach.state_machine_handler import handler as outreach_handler
from lambdas.rb_check_responses.state_machine_handler import handler as check_handler
from lambdas.rb_daily_report.main import handler as report_handler
from lambdas.rb_schedule_manager.main import handler as schedule_handler

def simulate_step_functions():
    import boto3
    from datetime import datetime
    
    REGION = os.getenv("AWS_REGION", "us-east-1")
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    requests_table = dynamodb.Table("rb_requests")
    users_table = dynamodb.Table("rb_users")
    
    # Create a dummy request to ensure it works
    test_req_id = "req_thal_test1"
    
    print("\n--- [Seeding Dummy Data into DynamoDB] ---")
    try:
        requests_table.put_item(Item={
            "request_id": test_req_id,
            "patient_id": "pat_test_123",
            "patient_name": "Test Patient",
            "blood_group": "B+",
            "location": "Local Hospital",
            "status": "matching",
            "created_at": datetime.utcnow().isoformat() + "Z"
        })
        # Add a dummy donor so matching isn't exhausted
        users_table.put_item(Item={
            "user_id": "donor_test_123",
            "role": "donor",
            "status": "active",
            "blood_group": "B+",
            "name": "Rajendra Guttedar",
            "email": "rajendraguttedar55@gmail.com"
        })
        print("Successfully seeded dummy request and donor.")
    except Exception as e:
        print("Failed to seed dummy data:", e)

    print("\n=== 1. Starting Thalassemia Schedule Manager (EventBridge Mock) ===")
    schedule_result = schedule_handler({}, {})
    print(json.dumps(schedule_result, indent=2))
    
    print("\n=== 2. Starting Match Donors (Step Functions - Step 1) ===")
    match_input = {
        "request_id": test_req_id,
        "patient_id": "pat_test_123",
        "batch_index": 0,
        "global_pool_fallback": False
    }
    match_result = match_handler(match_input, {})
    print(json.dumps(match_result, indent=2))
    
    print("\n=== 3. Starting Send Outreach (Step Functions - Step 2) ===")
    
    # Note: AWS SES is in Sandbox mode. It will only send emails to addresses you have manually verified in the SES Console.
    # If the matched donor's email is not verified, SES will throw a 'MessageRejected' error below.
        
    outreach_input = {"MatchResults": match_result}
    outreach_result = outreach_handler(outreach_input, {})
    print(json.dumps(outreach_result, indent=2))
    
    print("\n--- [Simulating Donor Clicking 'Accept Request' from Email] ---")
    requests_table.update_item(
        Key={"request_id": test_req_id},
        UpdateExpression="SET #s = :s, assigned_donor = :d",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":s": "confirmed",
            ":d": "donor_test_123"
        }
    )
    print("Donor successfully clicked accept!")

    print("\n=== 4. Checking Responses (Step Functions - Step 4) ===")
    check_input = {"request_id": test_req_id}
    check_result = check_handler(check_input, {})
    print(json.dumps(check_result, indent=2))
    
    print("\n=== 5. Sending Daily Report (EventBridge Mock) ===")
    report_result = report_handler({}, {})
    print(json.dumps(report_result, indent=2))
    
if __name__ == "__main__":
    print("Testing Automation Pipeline Locally...\n")
    try:
        simulate_step_functions()
    except Exception as e:
        print(f"Test failed: {e}")
        print("Note: If DynamoDB or SES fails, it means you need AWS credentials or LocalDB running.")
