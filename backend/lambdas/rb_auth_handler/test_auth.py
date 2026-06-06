from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def test_auth_flow():
    # 1. Register
    print("Testing Registration...")
    reg_response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "SecurePassword123",
        "name": "Test User",
        "role": "donor",
        "phone": "+919876543210"
    })
    
    # Registration might fail if already exists, that's okay for testing
    if reg_response.status_code == 400 and "Email already registered" in reg_response.text:
        print("User already registered, proceeding to login.")
    else:
        assert reg_response.status_code == 201
        print("Registration successful:", json.dumps(reg_response.json(), indent=2))
        
    # 2. Login
    print("\nTesting Login...")
    login_response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "SecurePassword123"
    })
    
    assert login_response.status_code == 200
    data = login_response.json()
    print("Login successful:", json.dumps(data, indent=2))
    
    token = data["data"]["token"]
    
    # 3. Get Me
    print("\nTesting Get Me...")
    me_response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    print("Get Me successful:", json.dumps(me_response.json(), indent=2))

if __name__ == "__main__":
    try:
        test_auth_flow()
        print("\nAll Auth tests passed successfully!")
    except AssertionError as e:
        print("\nTest failed!")
