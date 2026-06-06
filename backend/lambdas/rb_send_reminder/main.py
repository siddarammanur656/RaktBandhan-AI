import json
import boto3
import os
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Attr

REGION = os.getenv("AWS_REGION", "us-east-1")
SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "admin@example.com")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")
SCHEDULES_TABLE_NAME = os.getenv("SCHEDULES_TABLE", "rb_schedules")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

ses = boto3.client('ses', region_name=REGION)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)
schedules_table = dynamodb.Table(SCHEDULES_TABLE_NAME)
users_table = dynamodb.Table(USERS_TABLE_NAME)

def send_urgent_email(donor_email, donor_name, patient_name, donation_date, request_id, donor_id):
    html_email = f"""
    <html>
    <body>
        <h2>URGENT: Blood Donation Needed Tomorrow! 🩸</h2>
        <p>Hi {donor_name},</p>
        <p>A fellow donor in {patient_name}'s circle is unavailable. We urgently need your help for a transfusion scheduled for tomorrow.</p>
        <p><strong>Date:</strong> {donation_date}</p>
        <p>Please confirm your availability immediately:</p>
        <p><a href="{FRONTEND_URL}/schedule/response/{request_id}?donor={donor_id}" style="padding: 10px 20px; background-color: #E53E3E; color: white; text-decoration: none; border-radius: 5px;">Respond Now</a></p>
        <p>Thank you for stepping up to save a life!</p>
    </body>
    </html>
    """
    try:
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [donor_email]},
            Message={
                'Subject': {'Data': f"URGENT: Blood donation needed tomorrow"},
                'Body': {'Html': {'Data': html_email}}
            }
        )
    except Exception as e:
        print(f"Failed to send urgent email: {e}")

def send_standard_reminder(donor_email, donor_name, patient_name, donation_date, hospital_location):
    html_email = f"""
    <html>
    <body>
        <h2>Friendly Reminder! 🩸</h2>
        <p>Hi {donor_name},</p>
        <p>This is a quick reminder about your confirmed blood donation tomorrow for {patient_name}.</p>
        <p><strong>Date:</strong> {donation_date}</p>
        <p><strong>Location:</strong> {hospital_location}</p>
        <p>Thank you for saving a life!</p>
    </body>
    </html>
    """
    try:
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [donor_email]},
            Message={
                'Subject': {'Data': f"⏰ Reminder: Blood donation tomorrow"},
                'Body': {'Html': {'Data': html_email}}
            }
        )
    except Exception as e:
        print(f"Failed to send standard reminder: {e}")

def handler(event, context):
    print("SendReminder Event:", json.dumps(event))
    
    tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    # Fetch all requests scheduled for tomorrow
    try:
        response = requests_table.scan(
            FilterExpression=Attr("required_by_date").eq(tomorrow)
        )
        requests = response.get("Items", [])
    except Exception as e:
        print("Failed to fetch requests:", e)
        return {"success": False, "error": str(e)}
        
    processed = 0
    for req in requests:
        status = req.get("status")
        patient_id = req.get("patient_id")
        assigned_donor_id = req.get("assigned_donor_id")
        
        # Get patient name
        patient_name = "Unknown Patient"
        if patient_id:
            p_resp = users_table.get_item(Key={"user_id": patient_id})
            if p_resp.get("Item"):
                patient_name = p_resp["Item"].get("name", "Unknown Patient")
                
        # 1-Day Fallback Escallation
        if status in ["matching", "declined"] and req.get("is_thalassemia"):
            schedule_id = req.get("schedule_id")
            if not schedule_id:
                continue
                
            sch_resp = schedules_table.get_item(Key={"schedule_id": schedule_id})
            sch = sch_resp.get("Item")
            if not sch:
                continue
                
            donor_circle = sch.get("donor_circle", [])
            current_index = int(sch.get("current_donor_index", 0))
            
            if not donor_circle:
                continue
                
            # Move to next donor
            next_index = (current_index + 1) % len(donor_circle)
            new_donor_id = donor_circle[next_index]
            
            # Send urgent email
            d_resp = users_table.get_item(Key={"user_id": new_donor_id})
            d_item = d_resp.get("Item")
            if d_item and d_item.get("email"):
                send_urgent_email(
                    donor_email=d_item["email"],
                    donor_name=d_item.get("name", "Donor"),
                    patient_name=patient_name,
                    donation_date=tomorrow,
                    request_id=req["request_id"],
                    donor_id=new_donor_id
                )
                
                # Update Request and Schedule
                requests_table.update_item(
                    Key={"request_id": req["request_id"]},
                    UpdateExpression="SET assigned_donor_id = :d, #s = :s",
                    ExpressionAttributeNames={"#s": "status"},
                    ExpressionAttributeValues={":d": new_donor_id, ":s": "matching"}
                )
                schedules_table.update_item(
                    Key={"schedule_id": schedule_id},
                    UpdateExpression="SET current_donor_index = :idx",
                    ExpressionAttributeValues={":idx": next_index}
                )
                processed += 1
                
        # Standard Reminder
        elif status == "confirmed" and assigned_donor_id:
            d_resp = users_table.get_item(Key={"user_id": assigned_donor_id})
            d_item = d_resp.get("Item")
            if d_item and d_item.get("email"):
                send_standard_reminder(
                    donor_email=d_item["email"],
                    donor_name=d_item.get("name", "Donor"),
                    patient_name=patient_name,
                    donation_date=tomorrow,
                    hospital_location=req.get("city", "Hospital")
                )
                processed += 1
                
    return {"success": True, "processed": processed}
