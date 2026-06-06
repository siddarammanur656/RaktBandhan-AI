import os
import sys
import json
from fastapi.testclient import TestClient
from jose import jwt
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from main import app

client = TestClient(app)

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

def create_mock_token(user_id, role="admin"):
    to_encode = {"sub": user_id, "role": role}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def test_admin_dashboard():
    print("Testing Admin Dashboard API...")
    
    token = create_mock_token("admin_test_123")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/admin/dashboard", headers=headers)
    assert res.status_code == 200
    
    data = res.json()
    assert data["success"] == True
    
    print("Dashboard Response:")
    print(json.dumps(data["data"], indent=2))
    print("\nAdmin Dashboard test passed successfully!")

if __name__ == "__main__":
    test_admin_dashboard()
