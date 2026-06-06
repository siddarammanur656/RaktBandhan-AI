import os
import sys
import json
import importlib.util
from fastapi.testclient import TestClient

lambdas_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def load_app(path, name):
    sys.modules.pop('schemas', None)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    
    # Temporarily prepend the directory to sys.path
    mod_dir = os.path.dirname(path)
    sys.path.insert(0, mod_dir)
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path.pop(0)
        
    return module.app

match_app = load_app(os.path.join(lambdas_dir, 'rb_match_donors', 'main.py'), 'match_main')
donor_app = load_app(os.path.join(lambdas_dir, 'rb_donor_handler', 'main.py'), 'donor_main')
outreach_app = load_app(os.path.join(os.path.dirname(__file__), 'main.py'), 'outreach_main')

from jose import jwt
from datetime import datetime, timedelta

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

match_client = TestClient(match_app)
donor_client = TestClient(donor_app)
outreach_client = TestClient(outreach_app)

def create_mock_token(user_id, role):
    to_encode = {"sub": user_id, "role": role}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def test_full_outreach_flow():
    print("=== Step 1: Matching Engine ===")
    admin_token = create_mock_token(user_id="a_admin", role="admin")
    res = match_client.post("/api/match/find-donors", json={
        "blood_group": "O Positive",
        "latitude": 17.39228,
        "longitude": 78.46027,
        "max_distance_km": 50,
        "limit": 1
    }, headers={"Authorization": f"Bearer {admin_token}"})
    
    match_data = res.json()
    if not match_data.get("data") or not match_data["data"]["donors"]:
        print("No donors found to test outreach!")
        return
        
    top_donor = match_data["data"]["donors"][0]
    print(f"Found Top Donor: {top_donor['name']} ({top_donor['user_id']})")
    
    print("\n=== Step 2: Send Outreach Email ===")
    request_id = "req_test_123"
    
    res = outreach_client.post("/api/outreach/send", json={
        "request_id": request_id,
        "donor_id": top_donor["user_id"],
        "donor_name": top_donor["name"],
        "donor_email": "mockdonor@example.com",
        "patient_name": "Ravi (Test Patient)",
        "blood_group": "O Positive",
        "hospital_location": "Apollo Hospital, Jubilee Hills",
        "distance_km": top_donor["distance_km"],
        "required_by_date": "Today"
    })
    
    outreach_data = res.json()
    assert outreach_data["success"] == True
    print(outreach_data["message"])
    print(f"Visual HTML file generated at: {outreach_data['data']['file_path']}")
    
    print("\n=== Step 3: Donor Accepts Request ===")
    donor_token = create_mock_token(user_id=top_donor["user_id"], role="donor")
    res = donor_client.post(f"/api/donors/requests/{request_id}/accept", headers={"Authorization": f"Bearer {donor_token}"})
    
    accept_data = res.json()
    assert accept_data["success"] == True
    print(f"Accept Success: {accept_data['message']}")
    print(json.dumps(accept_data["data"], indent=2))

if __name__ == "__main__":
    try:
        test_full_outreach_flow()
        print("\nAll Outreach Workflow tests passed successfully!")
    except AssertionError as e:
        print("\nTest failed!")
