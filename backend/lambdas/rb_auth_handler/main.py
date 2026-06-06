from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from datetime import datetime, timedelta
from jose import jwt, JWTError
import hashlib
import uuid
import os
import boto3
from dotenv import load_dotenv
import logging

from schemas import RegisterRequest, LoginRequest

# Load environment variables (useful for local testing)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

app = FastAPI(title="RaktBandhan AI - Auth Handler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")

JWT_SECRET_KEY = "raktbandhan-local-secret-key" # For local mock auth
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

# Initialize DynamoDB
if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

users_table = dynamodb.Table(USERS_TABLE_NAME)

# Utility functions
def hash_password(password: str) -> str:
    """Mock password hashing for local dev."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Missing or invalid token", "code": "UNAUTHORIZED"})
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
    except JWTError:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid token", "code": "UNAUTHORIZED"})
        
    # Fetch user from DB
    response = users_table.get_item(Key={"user_id": user_id})
    user = response.get("Item")
    if not user:
        raise HTTPException(status_code=404, detail={"success": False, "error": "User not found", "code": "NOT_FOUND"})
        
    return user

# Routes
@app.post("/api/auth/register", status_code=201)
def register(request: RegisterRequest):
    # Check if email exists using GSI
    response = users_table.query(
        IndexName="email-index",
        KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(request.email)
    )
    if response.get('Items'):
        raise HTTPException(status_code=400, detail={"success": False, "error": "Email already registered", "code": "EMAIL_EXISTS"})

    # Create new user
    prefix = "p_" if request.role == "patient" else ("a_" if request.role == "admin" else "u_")
    user_id = f"{prefix}{uuid.uuid4().hex[:8]}"
    
    new_user = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "role": request.role,
        "phone": request.phone,
        "password_hash": hash_password(request.password), # Mock Auth
        "status": "active"
    }
    
    users_table.put_item(Item=new_user)
    
    return {
        "success": True,
        "data": {
            "user_id": user_id,
            "email": request.email,
            "role": request.role
        },
        "message": "Registration successful. Please verify email."
    }

@app.post("/api/auth/login")
def login(request: LoginRequest):
    response = users_table.query(
        IndexName="email-index",
        KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(request.email)
    )
    items = response.get('Items')
    if not items:
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid email or password", "code": "INVALID_CREDENTIALS"})
        
    user = items[0]
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail={"success": False, "error": "Invalid email or password", "code": "INVALID_CREDENTIALS"})
        
    # Generate token
    token = create_access_token(data={"sub": user["user_id"], "role": user["role"]})
    
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "user_id": user["user_id"],
                "name": user.get("name", ""),
                "email": user["email"],
                "role": user["role"]
            }
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "user_id": current_user["user_id"],
            "name": current_user.get("name", ""),
            "email": current_user["email"],
            "role": current_user["role"],
            "phone": current_user.get("phone", "")
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Lambda handler
handler = Mangum(app)
