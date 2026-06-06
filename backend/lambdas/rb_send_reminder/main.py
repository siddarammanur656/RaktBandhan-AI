import json
import boto3
import os

REGION = os.getenv("AWS_REGION", "us-east-1")
SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "admin@example.com") 

ses = boto3.client('ses', region_name=REGION)

def handler(event, context):
    print("SendReminder Event:", json.dumps(event))
    
    # Payload from EventBridge target input
    donor_email = event.get("donor_email")
    donor_name = event.get("donor_name")
    patient_name = event.get("patient_name")
    hospital_location = event.get("hospital_location")
    donation_date = event.get("donation_date")
    
    if not donor_email:
        return {"success": False, "error": "No donor email provided"}
        
    html_email = f"""
    <html>
    <body>
        <h2>Friendly Reminder! 🩸</h2>
        <p>Hi {donor_name},</p>
        <p>This is a quick reminder about your scheduled blood donation tomorrow for {patient_name}.</p>
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
        print(f"Sent reminder to {donor_email}")
        return {"success": True}
    except Exception as e:
        print(f"SES Failed for reminder to {donor_email}: {e}")
        return {"success": False, "error": str(e)}
