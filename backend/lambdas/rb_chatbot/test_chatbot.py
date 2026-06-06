import os
import sys
from fastapi.testclient import TestClient
from jose import jwt
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from main import app

client = TestClient(app)

JWT_SECRET_KEY = "raktbandhan-local-secret-key"
JWT_ALGORITHM = "HS256"

def create_mock_token(user_id):
    to_encode = {"sub": user_id, "role": "donor"}
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def test_chatbot():
    print("Testing Chatbot API...")
    
    # We use Donor 4 (Perfect) from previous mock data, but any valid donor_id works
    token = create_mock_token("u_donor_4")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "message": "When can I donate next?"
    }
    
    res = client.post("/api/chat/message", json=payload, headers=headers)
    assert res.status_code == 200
    
    data = res.json()
    assert data["success"] == True
    
    print("Chatbot Response:")
    print(data["data"]["response"])
    print("\nChatbot test passed successfully!")

if __name__ == "__main__":
    test_chatbot()
