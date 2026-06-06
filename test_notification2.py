from backend.lambdas.rb_request_handler.main import trigger_patient_notification
import os
import time

print('Triggering patient notification directly...')
# request_id, req_data, donor_id, confirmed_date
trigger_patient_notification("req_test_999", {"patient_id": "p_test_123", "blood_group": "A+", "city": "Apollo Hospital"}, "d_test_456", "2026-06-10")

time.sleep(2)

emails_dir = os.path.join('backend', 'data', 'emails')
if os.path.exists(emails_dir):
    files = [f for f in os.listdir(emails_dir) if f.startswith('patient_notification_req_test_999')]
    if files:
        print(f'SUCCESS! Found notification files: {files}')
    else:
        print('FAILED: No patient notification files found.')
else:
    print('FAILED: Emails directory does not exist.')
