import json
import boto3
import os
from datetime import datetime

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")
ADMIN_EMAIL = os.getenv("SES_SENDER_EMAIL", "admin@example.com") # Using same verified email for sandbox

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)
bedrock = boto3.client('bedrock-runtime', region_name=REGION)
ses = boto3.client('ses', region_name=REGION)

def handler(event, context):
    print("DailyReport Event:", json.dumps(event))
    
    # 1. Gather stats from DynamoDB for today
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    try:
        response = requests_table.scan()
        all_reqs = response.get("Items", [])
    except Exception as e:
        print("Failed to fetch requests:", e)
        return {"success": False, "error": str(e)}
        
    today_reqs = [r for r in all_reqs if r.get("created_at", "").startswith(today_str)]
    
    total = len(today_reqs)
    fulfilled = sum(1 for r in today_reqs if r.get("status") in ["confirmed", "fulfilled"])
    escalated = sum(1 for r in today_reqs if r.get("status") == "escalated")
    
    stats_json = json.dumps({
        "date": today_str,
        "total_requests": total,
        "auto_fulfilled": fulfilled,
        "escalated_to_admin": escalated
    })
    
    # 2. Use Bedrock to write the report
    prompt = f"""
    You are the AI assistant for RaktBandhan, a blood donation platform.
    Write a short, friendly daily summary email to the Admin based on these stats:
    {stats_json}
    Keep it concise, professional, and highlight the automation success.
    """
    
    try:
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "messages": [{"role": "user", "content": prompt}]
        }
        b_response = bedrock.invoke_model(
            modelId='us.anthropic.claude-haiku-4-5-20251001-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps(payload)
        )
        body = json.loads(b_response['body'].read())
        email_body = body['content'][0]['text']
    except Exception as e:
        print("Bedrock failed:", e)
        email_body = f"Daily Report for {today_str}:\nTotal: {total}\nFulfilled: {fulfilled}\nEscalated: {escalated}"
        
    # 3. Send via SES
    try:
        ses.send_email(
            Source=ADMIN_EMAIL,
            Destination={'ToAddresses': [ADMIN_EMAIL]},
            Message={
                'Subject': {'Data': f"📊 RaktBandhan Daily Report - {today_str}"},
                'Body': {'Text': {'Data': email_body}}
            }
        )
        print("Sent daily report to", ADMIN_EMAIL)
    except Exception as e:
        print("SES Failed:", e)
        
    return {"success": True, "report_sent": True}
