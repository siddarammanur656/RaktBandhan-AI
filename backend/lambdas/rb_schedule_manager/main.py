import json
import boto3
import os
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Attr

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
SCHEDULES_TABLE_NAME = os.getenv("SCHEDULES_TABLE", "rb_schedules")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "admin@example.com")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

ses = boto3.client('ses', region_name=REGION)
schedules_table = dynamodb.Table(SCHEDULES_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)
users_table = dynamodb.Table(USERS_TABLE_NAME)

def get_matching_donors(blood_group, needed_count, exclude_ids):
    try:
        response = users_table.scan(
            FilterExpression=Attr("role").eq("donor") & Attr("status").eq("active") & Attr("blood_group").eq(blood_group)
        )
        donors = response.get("Items", [])
        valid_donors = [d for d in donors if d.get("user_id") not in exclude_ids]
        # Sort by reliability score or just take first needed
        valid_donors.sort(key=lambda x: int(x.get("reliability_score", 0)), reverse=True)
        return [d["user_id"] for d in valid_donors[:needed_count]]
    except Exception as e:
        print(f"Failed to fetch donors: {e}")
        return []

def send_7_day_email(donor_email, donor_name, patient_name, donation_date, request_id, donor_id):
    html_email = f"""
    <html>
    <body>
        <h2>Thalassemia Blood Donation Required! 🩸</h2>
        <p>Hi {donor_name},</p>
        <p>You are a permanent donor for {patient_name}. A transfusion is scheduled 7 days from now.</p>
        <p><strong>Date:</strong> {donation_date}</p>
        <p>Please confirm your availability, reschedule, or manage your circle participation by clicking the link below:</p>
        <p><a href="{FRONTEND_URL}/schedule/response/{request_id}?donor={donor_id}" style="padding: 10px 20px; background-color: #E53E3E; color: white; text-decoration: none; border-radius: 5px;">Manage Request</a></p>
        <p>Thank you for your continuous support!</p>
    </body>
    </html>
    """
    try:
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [donor_email]},
            Message={
                'Subject': {'Data': f"Action Required: Blood donation next week"},
                'Body': {'Html': {'Data': html_email}}
            }
        )
    except Exception as e:
        print(f"Failed to send 7-day email: {e}")

def handler(event, context):
    print("ScheduleManager Event:", json.dumps(event))
    
    try:
        response = schedules_table.scan(
            FilterExpression=Attr("active_status").eq("true")
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
            
        days_until = (next_date - now).days
        if 0 <= days_until <= 7:
            last_request_date = schedule.get("last_request_created_date")
            if last_request_date and last_request_date == next_date_str:
                continue
                
            blood_group = schedule.get("blood_group")
            
            # 1. Ensure Donor Circle has up to 8 donors
            donor_circle = schedule.get("donor_circle", [])
            current_index = int(schedule.get("current_donor_index", 0))
            
            if len(donor_circle) < 8:
                needed = 8 - len(donor_circle)
                new_donors = get_matching_donors(blood_group, needed, donor_circle)
                donor_circle.extend(new_donors)
                
            if not donor_circle:
                print(f"Warning: No donors found for circle. Patient {schedule.get('patient_id')}")
                continue
                
            # If current index is out of bounds (due to removal), reset to 0
            if current_index >= len(donor_circle):
                current_index = 0
                
            assigned_donor_id = donor_circle[current_index]
            
            # Fetch patient details for email
            patient_resp = users_table.get_item(Key={"user_id": schedule.get("patient_id")})
            patient_name = patient_resp.get("Item", {}).get("name", "Unknown") if patient_resp.get("Item") else "Unknown"
            
            # Create Request
            import uuid
            request_id = f"req_thal_{uuid.uuid4().hex[:8]}"
            
            new_req = {
                "request_id": request_id,
                "patient_id": schedule.get("patient_id"),
                "blood_group": blood_group,
                "quantity_units": 1,
                "city": schedule.get("city", "Unknown"),
                "urgency": "scheduled",
                "required_by_date": next_date_str,
                "status": "matching",
                "is_thalassemia": True,
                "assigned_donor_id": assigned_donor_id,
                "schedule_id": schedule.get("schedule_id"),
                "created_at": now.isoformat() + "Z"
            }
            
            requests_table.put_item(Item=new_req)
            
            # Fetch assigned donor email
            donor_resp = users_table.get_item(Key={"user_id": assigned_donor_id})
            donor_item = donor_resp.get("Item")
            
            if donor_item and donor_item.get("email"):
                send_7_day_email(
                    donor_email=donor_item["email"],
                    donor_name=donor_item.get("name", "Donor"),
                    patient_name=patient_name,
                    donation_date=next_date_str,
                    request_id=request_id,
                    donor_id=assigned_donor_id
                )
            
            # Update Schedule
            next_index = (current_index + 1) % len(donor_circle)
            schedules_table.update_item(
                Key={"schedule_id": schedule["schedule_id"]},
                UpdateExpression="SET last_request_created_date = :d, donor_circle = :dc, current_donor_index = :idx",
                ExpressionAttributeValues={
                    ":d": next_date_str,
                    ":dc": donor_circle,
                    ":idx": next_index
                }
            )
            created_count += 1
            
    return {
        "success": True,
        "requests_created": created_count
    }
