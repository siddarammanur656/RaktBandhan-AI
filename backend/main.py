from fastapi import FastAPI
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RaktBandhan AI API",
    description="Backend API for RaktBandhan blood coordination platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "RaktBandhan API is running."}

# Mangum wrapper for AWS Lambda
handler = Mangum(app)
