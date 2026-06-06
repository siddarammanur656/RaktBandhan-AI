from fastapi.testclient import TestClient
from main import app, JWT_SECRET_KEY, JWT_ALGORITHM
from jose import jwt
from datetime import datetime, timedelta
import boto3
import json
import os
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

client = TestClient(app)

def create_mock_token(user_id="p_mock_patient", role="patient"):
    to_encode = {"sub": user_id, "role": role}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def setup_mock_data():
    REGION = os.getenv("AWS_REGION", "us-east-1")
    ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
    
    users_table = dynamodb.Table(os.getenv("USERS_TABLE", "rb_users"))
    
    # 1. Add patient
    users_table.put_item(Item={
        "user_id": "p_mock_patient",
        "role": "patient",
        "email": "mockpatient@example.com",
        "name": "Mock Patient",
        "status": "active"
    })
    
    # 2. Add donors
    mock_donors = [
        {
            "user_id": "u_donor_1", # Compatible (O- is universal donor), close (1.1km)
            "role": "donor",
            "name": "Donor 1 (O-)",
            "blood_group": "O Negative",
            "latitude": Decimal("17.40000"),
            "longitude": Decimal("78.46000"),
            "status": "active",
            "reliability_score": Decimal("50"),
            "total_donations": Decimal("2")
        },
        {
            "user_id": "u_donor_2", # Incompatible (AB+ cannot donate to B+)
            "role": "donor",
            "name": "Donor 2 (AB+)",
            "blood_group": "AB Positive",
            "latitude": Decimal("17.39228"),
            "longitude": Decimal("78.46027"), # Exact same spot!
            "status": "active"
        },
        {
            "user_id": "u_donor_3", # Compatible (B+), but far away (100km+)
            "role": "donor",
            "name": "Donor 3 (Far)",
            "blood_group": "B Positive",
            "latitude": Decimal("18.00000"),
            "longitude": Decimal("79.00000"),
            "status": "active"
        },
        {
            "user_id": "u_donor_4", # Compatible (B+), very close, high reliability
            "role": "donor",
            "name": "Donor 4 (Perfect)",
            "blood_group": "B Positive",
            "latitude": Decimal("17.39220"),
            "longitude": Decimal("78.46020"),
            "status": "active",
            "reliability_score": Decimal("80"),
            "total_donations": Decimal("5")
        }
    ]
    
    for d in mock_donors:
        users_table.put_item(Item=d)

def test_match_flow():
    setup_mock_data()
    token = create_mock_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing Find Matching Donors for B Positive patient at (17.39228, 78.46027)...")
    res = client.post("/api/match/find-donors", json={
        "blood_group": "B Positive",
        "latitude": 17.39228,
        "longitude": 78.46027,
        "max_distance_km": 50,
        "limit": 100
    }, headers=headers)
    
    assert res.status_code == 200
    data = res.json()["data"]
    print("Match Results:", json.dumps(data, indent=2))
    
    # Verification
    # Should include Donor 1 and Donor 4. 
    # Donor 2 is incompatible. Donor 3 is too far.
    names = [d["name"] for d in data["donors"]]
    assert "Donor 4 (Perfect)" in names, "Donor 4 should be found"
    assert "Donor 1 (O-)" in names, "Donor 1 should be found"
    assert "Donor 2 (AB+)" not in names, "Donor 2 should be filtered out (incompatible)"
    assert "Donor 3 (Far)" not in names, "Donor 3 should be filtered out (distance)"

if __name__ == "__main__":
    try:
        test_match_flow()
        print("\nAll Matching Engine tests passed successfully!")
    except AssertionError as e:
        print("\nTest failed!")
