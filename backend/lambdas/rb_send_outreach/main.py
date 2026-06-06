from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os

from schemas import OutreachRequest

app = FastAPI(title="RaktBandhan AI - Outreach Handler (Local Mock)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'outreach_email.html')
EMAILS_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'emails')

@app.post("/api/outreach/send")
def send_outreach_email(payload: OutreachRequest):
    if not os.path.exists(TEMPLATE_PATH):
        raise HTTPException(status_code=500, detail="Template not found")
        
    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        html_template = f.read()
        
    # Simple string replacement (to avoid CSS brace conflicts with .format)
    html_content = html_template \
        .replace("{donor_name}", payload.donor_name) \
        .replace("{patient_name}", payload.patient_name) \
        .replace("{blood_group}", payload.blood_group) \
        .replace("{hospital_location}", payload.hospital_location) \
        .replace("{distance_km}", str(payload.distance_km)) \
        .replace("{required_by_date}", payload.required_by_date) \
        .replace("{request_id}", payload.request_id)
    
    # Save the mocked email locally
    os.makedirs(EMAILS_OUTPUT_DIR, exist_ok=True)
    output_filename = f"{payload.request_id}_{payload.donor_id}.html"
    output_path = os.path.join(EMAILS_OUTPUT_DIR, output_filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Mock SES: Sent email to {payload.donor_email}. Saved to {output_path}")
    
    return {
        "success": True,
        "message": f"Email successfully generated and sent to {payload.donor_email}",
        "data": {
            "file_path": output_path
        }
    }

# Lambda handler
handler = Mangum(app)
