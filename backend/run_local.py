import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lambdas.rb_auth_handler.main import app as auth_app
from lambdas.rb_donor_handler.main import app as donor_app
from lambdas.rb_patient_handler.main import app as patient_app
from lambdas.rb_admin_handler.main import app as admin_app
from lambdas.rb_request_handler.main import app as request_app
from lambdas.rb_match_donors.main import app as match_app
from lambdas.rb_chatbot.main import app as chatbot_app
from lambdas.rb_copilot.main import app as copilot_app

app = FastAPI(title="RaktBandhan AI - Local Aggregator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_app.router)
app.include_router(donor_app.router)
app.include_router(patient_app.router)
app.include_router(admin_app.router)
app.include_router(request_app.router)
app.include_router(match_app.router)
app.include_router(chatbot_app.router)
app.include_router(copilot_app.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Unified Local RaktBandhan API is running."}

if __name__ == "__main__":
    print("Starting Local RaktBandhan API on port 8000...")
    uvicorn.run("run_local:app", host="0.0.0.0", port=8000, reload=True)
