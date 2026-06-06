from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from jose import jwt, JWTError
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
import json

app = FastAPI(title="RaktBandhan AI - Failure Analyzer")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)
bedrock_client = boto3.client('bedrock-runtime', region_name=REGION)

def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"error": "Missing token"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, "raktbandhan-local-secret-key", algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail={"error": "Admin access required"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"error": "Invalid token"})
    return payload

@app.get("/api/admin/insights/failures")
def get_failures(current_admin: dict = Depends(get_current_admin)):
    # 1. Fetch recent failed or unfulfilled requests
    # In a real setup, we might query an index or scan. We'll scan here for hackathon scale.
    try:
        response = requests_table.scan(
            FilterExpression=Attr("status").is_in(["failed", "exhausted", "expired"])
        )
        failed_requests = response.get("Items", [])
    except Exception as e:
        print(f"DynamoDB Error: {e}")
        failed_requests = []

    if not failed_requests:
        return {
            "success": True,
            "data": {
                "this_week": {
                    "total_failures": 0,
                    "by_reason": {}
                },
                "ai_recommendations": [
                    {
                        "issue": "No recent failures found.",
                        "recommendation": "Great job! The donor network is healthy.",
                        "priority": "low"
                    }
                ]
            }
        }

    # Aggregate basic stats
    total_failures = len(failed_requests)
    
    # Create a summarized list to send to the LLM (avoiding huge payload)
    summarized_failures = []
    for req in failed_requests:
        summarized_failures.append({
            "blood_group": req.get("blood_group", "Unknown"),
            "city": req.get("city", "Unknown"),
            "status": req.get("status", "failed"),
            "donors_contacted_count": len(req.get("donors_contacted", []))
        })
        
    summary_json_str = json.dumps(summarized_failures)

    system_prompt = """You are an AI data analyst for RaktBandhan, a blood donation platform.
I will provide you with a list of recently failed blood requests. Analyze the data to identify patterns (e.g. which blood groups or cities are failing most).
You must output ONLY a valid JSON object matching the following structure. Do NOT include markdown blocks or any other text.
{
  "by_reason": {
    "no_donors_found": <int>,
    "all_declined": <int>,
    "donor_no_show": <int>
  },
  "ai_recommendations": [
    {
      "issue": "<describe the pattern you found>",
      "recommendation": "<actionable recommendation>",
      "priority": "high" | "medium" | "low"
    }
  ]
}
The 'by_reason' counts should be your best estimation based on the data (e.g., 0 donors contacted means no_donors_found, etc).
"""

    try:
        bedrock_payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": f"Here is the data of failed requests:\n{summary_json_str}"}
            ]
        }
        
        bedrock_response = bedrock_client.invoke_model(
            modelId='us.anthropic.claude-haiku-4-5-20251001-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps(bedrock_payload)
        )
        
        response_body = json.loads(bedrock_response.get('body').read())
        ai_text = response_body.get('content', [{}])[0].get('text', '{}')
        
        # Parse the JSON from Bedrock
        analysis_result = json.loads(ai_text.strip())
        
        by_reason = analysis_result.get("by_reason", {})
        ai_recommendations = analysis_result.get("ai_recommendations", [])
        
    except Exception as e:
        print(f"Bedrock/Parsing Error: {e}")
        # Fallback if Bedrock fails
        by_reason = {"system_error": total_failures}
        ai_recommendations = [{
            "issue": f"{total_failures} requests failed recently.",
            "recommendation": "Manual review required. AI analysis temporarily unavailable.",
            "priority": "medium"
        }]

    return {
        "success": True,
        "data": {
            "this_week": {
                "total_failures": total_failures,
                "by_reason": by_reason
            },
            "ai_recommendations": ai_recommendations
        }
    }

handler = Mangum(app)
