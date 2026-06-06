import json
import urllib.request
from jose import jwt

# Generate JWT for Donor
donor_payload = {
    "sub": "test_donor_123",
    "role": "donor",
    "name": "Amit Kumar",
    "blood_group": "O+"
}
donor_token = jwt.encode(donor_payload, "raktbandhan-local-secret-key", algorithm="HS256")

print("Testing Chatbot...")
req = urllib.request.Request(
    'https://bsefgy4kqmppqdqsthdy57dyxu0lbuuv.lambda-url.us-east-1.on.aws/api/chat/message',
    data=json.dumps({"message": "I want to donate blood in Mumbai, am I eligible?", "session_id": "test_sess"}).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {donor_token}'
    }
)
try:
    resp = urllib.request.urlopen(req).read().decode()
    print("Chatbot Response:", resp)
except Exception as e:
    print("Chatbot Failed:", e)

# Generate JWT for Admin
admin_payload = {
    "sub": "admin_123",
    "role": "admin"
}
admin_token = jwt.encode(admin_payload, "raktbandhan-local-secret-key", algorithm="HS256")

print("\nTesting Copilot...")
req = urllib.request.Request(
    'https://bsefgy4kqmppqdqsthdy57dyxu0lbuuv.lambda-url.us-east-1.on.aws/api/admin/copilot',
    data=json.dumps({"query": "Find me all O+ donors in Mumbai"}).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {admin_token}'
    }
)
try:
    resp = urllib.request.urlopen(req).read().decode()
    print("Copilot Response:", json.dumps(json.loads(resp), indent=2))
except Exception as e:
    print("Copilot Failed:", e)
