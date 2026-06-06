import httpx
from fastapi.testclient import TestClient
from backend.run_local import app
from backend.lambdas.rb_request_handler.main import get_current_user
import os
import time

client = TestClient(app)
app.dependency_overrides[get_current_user] = lambda: {"user_id": "p_test_123", "role": "patient"}

req_data = {
    "patient_id": "p_test_123",
    "blood_group": "A+",
    "quantity_units": 1,
    "urgency": "normal",
    "required_by_date": "2026-06-10",
    "notes": "Testing patient notification"
}

print('Creating request...')
response = client.post('/api/requests', json=req_data)
if response.status_code == 201:
    req_id = response.json().get('data', {}).get('request_id')
    print(f'Request created: {req_id}')
    
    print('Simulating donor accept...')
    accept_url = f'/api/requests/accept?request_id={req_id}&donor_id=d_test_456'
    accept_response = client.get(accept_url, follow_redirects=False)
    print(f'Accept response status: {accept_response.status_code}')
    
    time.sleep(1) # wait for background task
    
    emails_dir = os.path.join('backend', 'data', 'emails')
    if os.path.exists(emails_dir):
        files = [f for f in os.listdir(emails_dir) if f.startswith(f'patient_notification_{req_id}')]
        if files:
            print(f'SUCCESS! Found notification files: {files}')
        else:
            print('FAILED: No patient notification files found.')
    else:
        print('FAILED: Emails directory does not exist.')
else:
    print(f'Failed to create request: {response.text}')

