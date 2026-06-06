import json
import urllib.request
from jose import jwt

# 1. Generate JWT tokens for testing
donor_payload = {
    "sub": "test_donor_123",
    "role": "donor",
    "name": "Amit Kumar",
    "blood_group": "O+"
}
donor_token = jwt.encode(donor_payload, "raktbandhan-local-secret-key", algorithm="HS256")

admin_payload = {
    "sub": "admin_123",
    "role": "admin"
}
admin_token = jwt.encode(admin_payload, "raktbandhan-local-secret-key", algorithm="HS256")

# The Live AWS API Endpoint
API_URL = "https://bsefgy4kqmppqdqsthdy57dyxu0lbuuv.lambda-url.us-east-1.on.aws"

print("====================================")
print("1. Testing Amazon Bedrock (Chatbot)")
print("====================================")
req = urllib.request.Request(
    f"{API_URL}/api/chat/message",
    data=json.dumps({"message": "Hi! I am Amit, can I donate blood today?", "session_id": "test_sess"}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {donor_token}'}
)
try:
    resp = urllib.request.urlopen(req).read().decode()
    print("Claude 4.5 Response:\n", json.loads(resp).get('data', {}).get('response'))
except Exception as e:
    print("Chatbot Failed:", e)


print("\n====================================")
print("2. Testing Amazon Bedrock (Admin Copilot)")
print("====================================")
req = urllib.request.Request(
    f"{API_URL}/api/admin/copilot",
    data=json.dumps({"query": "Find me all O+ donors in Mumbai"}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {admin_token}'}
)
try:
    resp = urllib.request.urlopen(req).read().decode()
    print("Copilot Automation Result:\n", json.dumps(json.loads(resp), indent=2))
except Exception as e:
    print("Copilot Failed:", e)


print("\n====================================")
print("3. Testing Amazon SageMaker (ML Model)")
print("====================================")
req = urllib.request.Request(
    f"{API_URL}/api/match/find-donors",
    data=json.dumps({
        "blood_group": "O+",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "max_distance_km": 50,
        "limit": 5
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {donor_token}'}
)
try:
    resp = urllib.request.urlopen(req).read().decode()
    print("SageMaker Predictions:\n", json.dumps(json.loads(resp), indent=2))
except Exception as e:
    print("SageMaker Failed:", e)
