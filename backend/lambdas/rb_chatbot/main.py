from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime
from jose import jwt, JWTError
import boto3
import json
import os
import uuid
from dotenv import load_dotenv

from .schemas import ChatMessageRequest

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Chatbot Handler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)

bedrock_client = boto3.client('bedrock-runtime', region_name=REGION)

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing token", "code": "UNAUTHORIZED"})
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=403, detail={"success": False, "error": "Access denied", "code": "FORBIDDEN"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
        
    response = users_table.get_item(Key={"user_id": user_id})
    user = response.get("Item")
    if not user:
        raise HTTPException(status_code=404, detail={"success": False, "error": "User not found", "code": "NOT_FOUND"})
    return user

@app.post("/api/chat/message")
def chat_message(request: ChatMessageRequest, current_user: dict = Depends(get_current_user)):
    user_name = current_user.get("name", "Donor")
    blood_group = current_user.get("blood_group", "Unknown")
    last_donation = current_user.get("last_donation_date", "Never")
    next_eligible = current_user.get("next_eligible_date", "Now")
    
    system_prompt = f"""You are RaktBandhan AI, a helpful assistant for a blood donation platform.
You are talking to {user_name}, whose blood group is {blood_group}.
Their last donation date was {last_donation}, and they are eligible to donate again on {next_eligible}.
Provide a short, friendly, and helpful response to their question."""

    user_message = request.message
    
    # Try calling AWS Bedrock
    try:
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        }
        
        response = bedrock_client.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0', # Standard Haiku model ID on Bedrock
            contentType='application/json',
            accept='application/json',
            body=json.dumps(payload)
        )
        
        response_body = json.loads(response.get('body').read())
        ai_response = response_body.get('content', [{}])[0].get('text', "I couldn't process that.")
        
    except Exception as e:
        # Fallback if Bedrock fails (e.g., due to local mock credentials)
        print(f"Bedrock invocation failed: {e}")
        ai_response = f"Hi {user_name}! I am RaktBandhan AI (Local Mock). You asked: '{user_message}'. Based on your profile, you are eligible to donate on {next_eligible}."

    session_id = request.session_id or f"sess_{uuid.uuid4().hex[:8]}"
    
    return {
        "success": True,
        "data": {
            "session_id": session_id,
            "response": ai_response,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }

# Lambda handler
handler = Mangum(app)
