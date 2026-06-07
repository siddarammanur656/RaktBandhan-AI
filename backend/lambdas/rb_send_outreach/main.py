from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os

from .schemas import OutreachRequest, PatientNotificationRequest

import boto3
from botocore.exceptions import ClientError

app = FastAPI(title="RaktBandhan AI - Outreach Handler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGION = os.getenv("AWS_REGION", "us-east-1")
ses_client = boto3.client('ses', region_name=REGION)
SENDER_EMAIL = "siddarammanur656@gmail.com"

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'outreach_email.html')
PATIENT_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'patient_notification.html')

def send_ses_email(to_address: str, subject: str, html_body: str):
    try:
        response = ses_client.send_email(
            Destination={
                'ToAddresses': [to_address],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': "UTF-8",
                        'Data': html_body,
                    },
                },
                'Subject': {
                    'Charset': "UTF-8",
                    'Data': subject,
                },
            },
            Source=f"RaktBandhan AI <{SENDER_EMAIL}>",
        )
        return response
    except ClientError as e:
        print(f"SES Error: {e.response['Error']['Message']}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.post("/api/outreach/send")
def send_outreach_email(payload: OutreachRequest):
    if not os.path.exists(TEMPLATE_PATH):
        raise HTTPException(status_code=500, detail="Template not found")
        
    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        html_template = f.read()
        
    # Simple string replacement (to avoid CSS brace conflicts with .format)
    html_content = html_template \
        .replace("{donor_name}", payload.donor_name) \
        .replace("{patient_name}", payload.patient_name) \
        .replace("{blood_group}", payload.blood_group) \
        .replace("{hospital_location}", payload.hospital_location) \
        .replace("{distance_km}", str(payload.distance_km)) \
        .replace("{required_by_date}", payload.required_by_date) \
        .replace("{request_id}", payload.request_id)
    
    # Send via SES
    subject = f"URGENT: {payload.blood_group} Blood Required Nearby"
    send_ses_email(payload.donor_email, subject, html_content)
    
    print(f"SES: Sent email to {payload.donor_email} successfully.")
    
    return {
        "success": True,
        "message": f"Email successfully sent to {payload.donor_email}"
    }

PATIENT_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'patient_notification.html')

@app.post("/api/outreach/notify-patient")
def notify_patient_email(payload: PatientNotificationRequest):
    if not os.path.exists(PATIENT_TEMPLATE_PATH):
        raise HTTPException(status_code=500, detail="Patient template not found")
        
    with open(PATIENT_TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        html_template = f.read()
        
    html_content = html_template \
        .replace("{patient_name}", payload.patient_name) \
        .replace("{blood_group}", payload.blood_group) \
        .replace("{hospital_location}", payload.hospital_location) \
        .replace("{confirmed_date}", payload.confirmed_date) \
        .replace("{donor_name}", payload.donor_name)
    
    # Send via SES
    subject = "RaktBandhan: A Donor has accepted your request!"
    send_ses_email(payload.patient_email, subject, html_content)
    
    print(f"SES: Sent patient notification to {payload.patient_email} successfully.")
    
    return {
        "success": True,
        "message": f"Patient notification successfully sent to {payload.patient_email}"
    }

# Lambda handler
handler = Mangum(app)
