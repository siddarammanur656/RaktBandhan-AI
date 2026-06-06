import json
import boto3
import os
import uuid

REGION = os.getenv("AWS_REGION", "us-east-1")
bedrock = boto3.client('bedrock-runtime', region_name=REGION)
ses = boto3.client('ses', region_name=REGION)

# Sender email must be verified in SES Sandbox
SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "rajendra@example.com") # User will need to set this in env
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000") # For local testing

def handler(event, context):
    print("SendOutreach Event:", json.dumps(event))
    
    # event is the output of MatchDonors
    match_results = event.get("MatchResults", {})
    if not match_results.get("success", False):
        return {"success": False, "reason": "Match failed or exhausted"}
        
    donors = match_results.get("matched_donors", [])
    request_id = match_results.get("request_id")
    patient_name = match_results.get("patient_name")
    hospital_location = match_results.get("hospital_location")
    blood_group = match_results.get("blood_group")
    
    sent_count = 0
    
    for donor in donors:
        donor_name = donor.get("donor_name")
        donor_email = donor.get("donor_email") # Must be verified in SES Sandbox for testing
        donor_id = donor.get("donor_id")
        
        # 1. Ask Bedrock to generate email
        prompt = f"""
        You are RaktBandhan AI. Write a very short, urgent but compassionate email to {donor_name}.
        A patient named {patient_name} needs {blood_group} blood at {hospital_location}.
        Distance is {donor.get('distance_km')} km.
        Keep it under 3 sentences. Do not include subject line in body.
        """
        try:
            payload = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 150,
                "messages": [{"role": "user", "content": prompt}]
            }
            response = bedrock.invoke_model(
                modelId='us.anthropic.claude-haiku-4-5-20251001-v1:0',
                contentType='application/json',
                accept='application/json',
                body=json.dumps(payload)
            )
            body = json.loads(response['body'].read())
            email_body = body['content'][0]['text']
        except Exception as e:
            print("Bedrock failed, using template:", e)
            email_body = f"Hi {donor_name}, {patient_name} urgently needs {blood_group} blood at {hospital_location}. Please help if you can!"
            
        # 2. Add action buttons (HTML)
        accept_link = f"{API_BASE_URL}/api/requests/accept?request_id={request_id}&donor_id={donor_id}"
        decline_link = f"{API_BASE_URL}/api/requests/decline?request_id={request_id}&donor_id={donor_id}"
        
        html_email = f"""
        <html>
        <body>
            <p>{email_body}</p>
            <br>
            <a href="{accept_link}" style="padding: 10px 20px; background-color: #e11d48; color: white; text-decoration: none; border-radius: 5px;">Accept Request</a>
            &nbsp;&nbsp;
            <a href="{decline_link}" style="padding: 10px 20px; background-color: #6b7280; color: white; text-decoration: none; border-radius: 5px;">Decline</a>
        </body>
        </html>
        """
        
        # 3. Send via SES
        try:
            ses.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [donor_email]},
                Message={
                    'Subject': {'Data': f"Urgent: {blood_group} Blood Needed Near You"},
                    'Body': {'Html': {'Data': html_email}}
                }
            )
            print(f"Sent email to {donor_email}")
            sent_count += 1
        except Exception as e:
            print(f"SES Failed for {donor_email}: {e}")
            
    # We pass the full event forward to keep state
    return {
        "success": True,
        "sent_count": sent_count,
        "request_id": request_id
    }
