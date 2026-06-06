from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from jose import jwt, JWTError

import os
import boto3
import json

app = FastAPI(title="RaktBandhan AI - Admin Copilot")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")
REQUESTS_TABLE_NAME = os.getenv("REQUESTS_TABLE", "rb_requests")

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)
requests_table = dynamodb.Table(REQUESTS_TABLE_NAME)

bedrock_client = boto3.client('bedrock-runtime', region_name=REGION)

class CopilotQuery(BaseModel):
    query: str

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

@app.post("/api/admin/copilot")
def copilot_query(request: CopilotQuery, current_admin: dict = Depends(get_current_admin)):
    system_prompt = """You are the RaktBandhan AI Admin Copilot.
You analyze the admin's query and output a strictly valid JSON response to orchestrate database actions.
Do NOT include any markdown formatting like ```json. Output ONLY the raw JSON string.
Supported Actions:
- search_donors: To find donors. Parameters: blood_group (optional), city (optional).
- search_requests: To find requests. Parameters: status (optional).
- general_insight: For general questions.

Your JSON must match this structure:
{
  "action": "search_donors" | "search_requests" | "general_insight",
  "parameters": { "blood_group": "...", "city": "...", "status": "..." },
  "suggested_followup": "What should the admin do next?"
}"""

    try:
        bedrock_payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "system": system_prompt,
            "messages": [{"role": "user", "content": request.query}]
        }
        
        response = bedrock_client.invoke_model(
            modelId='us.anthropic.claude-haiku-4-5-20251001-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps(bedrock_payload)
        )
        
        response_body = json.loads(response.get('body').read())
        ai_text = response_body.get('content', [{}])[0].get('text', '{}')
        
        # Parse the JSON
        intent = json.loads(ai_text.strip())
        
    except Exception as e:
        print(f"Bedrock Copilot Error: {e}")
        intent = {
            "action": "general_insight",
            "parameters": {},
            "suggested_followup": "Error analyzing query. Please try again."
        }

    action = intent.get("action")
    params = intent.get("parameters", {})
    results = []
    
    if action == "search_donors":
        # Scan for donors (mock-scale query)
        scan_kwargs = {"FilterExpression": boto3.dynamodb.conditions.Attr("role").eq("donor")}
        resp = users_table.scan(**scan_kwargs)
        for item in resp.get("Items", []):
            match = True
            if params.get("blood_group") and item.get("blood_group") != params.get("blood_group"): match = False
            if params.get("city") and item.get("city", "").lower() != params.get("city").lower(): match = False
            if match:
                results.append({
                    "user_id": item.get("user_id"),
                    "name": item.get("name"),
                    "blood_group": item.get("blood_group"),
                    "city": item.get("city"),
                    "reliability_score": str(item.get("reliability_score", 50))
                })
                
    elif action == "search_requests":
        scan_kwargs = {}
        if params.get("status"):
            scan_kwargs = {"FilterExpression": boto3.dynamodb.conditions.Attr("status").eq(params.get("status"))}
        resp = requests_table.scan(**scan_kwargs)
        for item in resp.get("Items", []):
            results.append({
                "request_id": item.get("request_id"),
                "blood_group": item.get("blood_group"),
                "city": item.get("city"),
                "status": item.get("status")
            })

    return {
        "success": True,
        "data": {
            "query_interpretation": f"Executed action: {action}",
            "result_count": len(results),
            "results": results[:50], # Limit output
            "suggested_followup": intent.get("suggested_followup", "")
        }
    }

handler = Mangum(app)

