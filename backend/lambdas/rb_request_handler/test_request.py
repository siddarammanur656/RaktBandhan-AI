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

def create_mock_token(user_id="a_mock_admin", role="admin"):
    to_encode = {"sub": user_id, "role": role}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def setup_mock_data():
    REGION = os.getenv("AWS_REGION", "us-east-1")
    ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
    
    users_table = dynamodb.Table(os.getenv("USERS_TABLE", "rb_users"))
    
    # 1. Ensure mock patient and admin exist in rb_users
    users_table.put_item(Item={
        "user_id": "p_mock_patient",
        "role": "patient",
        "email": "mockpatient@example.com",
        "name": "Mock Patient",
        "status": "active"
    })
    users_table.put_item(Item={
        "user_id": "a_mock_admin",
        "role": "admin",
        "email": "admin@example.com",
        "name": "Mock Admin",
        "status": "active"
    })

def test_request_flow():
    setup_mock_data()
    
    admin_token = create_mock_token(role="admin")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    patient_token = create_mock_token(user_id="p_mock_patient", role="patient")
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    
    print("Testing Create Request...")
    res = client.post("/api/requests", json={
        "patient_id": "p_mock_patient",
        "blood_group": "AB Positive",
        "quantity_units": 2,
        "latitude": 17.39228,
        "longitude": 78.46027,
        "urgency": "urgent",
        "required_by_date": "2024-12-01",
        "notes": "Need blood fast"
    }, headers=patient_headers)
    assert res.status_code == 201
    print("Create Request Success:", json.dumps(res.json(), indent=2))
    
    request_id = res.json()["data"]["request_id"]
    
    print(f"\nTesting Get Specific Request ({request_id})...")
    res = client.get(f"/api/requests/{request_id}", headers=admin_headers)
    assert res.status_code == 200
    print("Get Specific Request Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting List Requests (Admin)...")
    res = client.get("/api/requests", headers=admin_headers)
    assert res.status_code == 200
    print("List Requests Success:", json.dumps(res.json(), indent=2))
    
    print("\nTesting List Requests Filtered by Status (Admin)...")
    res = client.get("/api/requests?status=matching", headers=admin_headers)
    assert res.status_code == 200
    print("List Filtered Requests Success:", json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    try:
        test_request_flow()
        print("\nAll Request Handler tests passed successfully!")
    except AssertionError as e:
        print("\nTest failed!")
