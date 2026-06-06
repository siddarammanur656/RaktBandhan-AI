from fastapi.testclient import TestClient
from main import app, JWT_SECRET_KEY, JWT_ALGORITHM
from jose import jwt
from datetime import datetime, timedelta
import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

client = TestClient(app)

def create_mock_token(user_id="p_mock_patient"):
    to_encode = {"sub": user_id, "role": "patient"}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def setup_mock_data():
    REGION = os.getenv("AWS_REGION", "us-east-1")
    ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
    
    users_table = dynamodb.Table(os.getenv("USERS_TABLE", "rb_users"))
    donations_table = dynamodb.Table(os.getenv("DONATIONS_TABLE", "rb_donations"))
    
    # 1. Ensure mock patient exists in rb_users
    users_table.put_item(Item={
        "user_id": "p_mock_patient",
        "role": "patient",
        "email": "mockpatient@example.com",
        "name": "Mock Patient",
        "status": "active"
    })
    
    # 2. Add a past donation to test history
    donations_table.put_item(Item={
        "donation_id": "d_mock_123",
        "donor_id": "u_mock_donor",
        "patient_id": "p_mock_patient",
        "donation_date": "2024-05-01",
        "location": "Mock Hospital"
    })

def test_patient_flow():
    setup_mock_data()
    token = create_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing Profile Update (and Schedule Creation)...")
    res = client.post("/api/patients/profile", json={
        "blood_group": "A Negative",
        "date_of_birth": "2015-08-10",
        "latitude": 17.39228,
        "longitude": 78.46027,
        "transfusion_frequency_days": 14,
        "guardian_name": "Mock Guardian",
        "guardian_phone": "+910000000000"
    }, headers=headers)
    assert res.status_code == 200
    print("Profile Update Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting Dashboard Fetch...")
    res = client.get("/api/patients/dashboard", headers=headers)
    assert res.status_code == 200
    print("Dashboard Fetch Success:", json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    try:
        test_patient_flow()
        print("\nAll Patient Handler tests passed successfully!")
    except AssertionError as e:
        print("\nTest failed!")
