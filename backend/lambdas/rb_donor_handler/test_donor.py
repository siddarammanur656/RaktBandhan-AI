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

# Helper to generate a valid token for our mock user
def create_mock_token(user_id="u_mock_donor"):
    to_encode = {"sub": user_id, "role": "donor"}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def setup_mock_data():
    REGION = os.getenv("AWS_REGION", "us-east-1")
    ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
    
    users_table = dynamodb.Table(os.getenv("USERS_TABLE", "rb_users"))
    requests_table = dynamodb.Table(os.getenv("REQUESTS_TABLE", "rb_requests"))
    
    # 1. Ensure mock donor exists in rb_users
    users_table.put_item(Item={
        "user_id": "u_mock_donor",
        "role": "donor",
        "email": "mockdonor@example.com",
        "name": "Mock Donor",
        "status": "active"
    })
    
    # 2. Ensure mock request exists in rb_requests
    requests_table.put_item(Item={
        "request_id": "req_mock_123",
        "patient_id": "p_mock_patient",
        "status": "matching",
        "created_at": datetime.utcnow().isoformat() + "Z"
    })

def test_donor_flow():
    setup_mock_data()
    token = create_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing Profile Update...")
    res = client.post("/api/donors/profile", json={
        "blood_group": "B Positive",
        "gender": "Male",
        "date_of_birth": "1995-05-15",
        "latitude": 17.39228,
        "longitude": 78.46027,
        "donor_type": "Regular Donor"
    }, headers=headers)
    assert res.status_code == 200
    print("Profile Update Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting Location Update...")
    res = client.put("/api/donors/location", json={
        "latitude": 17.39228,
        "longitude": 78.46027
    }, headers=headers)
    assert res.status_code == 200
    print("Location Update Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting Dashboard Fetch...")
    res = client.get("/api/donors/dashboard", headers=headers)
    assert res.status_code == 200
    print("Dashboard Fetch Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting Request Accept...")
    res = client.post("/api/donors/requests/req_mock_123/accept", headers=headers)
    assert res.status_code == 200
    print("Request Accept Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting Request Decline...")
    res = client.post("/api/donors/requests/req_mock_123/decline", json={
        "reason": "Not available"
    }, headers=headers)
    assert res.status_code == 200
    print("Request Decline Success:", json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    try:
        test_donor_flow()
        print("\nAll Donor Handler tests passed successfully!")
    except AssertionError as e:
        print("\nTest failed!")
