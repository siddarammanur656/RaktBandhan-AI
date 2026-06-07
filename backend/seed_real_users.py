import boto3
import os
import hashlib
from decimal import Decimal
import uuid

# Configuration
REGION = os.getenv("AWS_REGION", "us-east-1")
USERS_TABLE_NAME = os.getenv("USERS_TABLE", "rb_users")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
users_table = dynamodb.Table(USERS_TABLE_NAME)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

password_hash = hash_password("password123")

users = [
    {
        "user_id": f"a_{uuid.uuid4().hex[:8]}",
        "email": "rajendraguttedar55@gmail.com",
        "name": "Rajendra Guttedar",
        "role": "admin",
        "phone": "+919876543210",
        "password_hash": password_hash,
        "status": "active"
    },
    {
        "user_id": f"u_{uuid.uuid4().hex[:8]}",
        "email": "siddarammanur656@gmail.com",
        "name": "Siddarammanur Donor",
        "role": "donor",
        "phone": "+918888888888",
        "password_hash": password_hash,
        "status": "active",
        "blood_group": "O+",
        "gender": "Male",
        "city": "Hyderabad",
        "latitude": Decimal("17.3850"),
        "longitude": Decimal("78.4867"),
        "donor_type": "whole_blood",
        "reliability_score": Decimal("85")
    },
    {
        "user_id": f"p_{uuid.uuid4().hex[:8]}",
        "email": "1dt22ca045@dsatm.edu.in",
        "name": "Student Patient",
        "role": "patient",
        "phone": "+917777777777",
        "password_hash": password_hash,
        "status": "active",
        "blood_group": "O+",
        "gender": "Male",
        "city": "Hyderabad",
        "latitude": Decimal("17.3850"),
        "longitude": Decimal("78.4867")
    }
]

for user in users:
    print(f"Seeding {user['email']} as {user['role']}...")
    users_table.put_item(Item=user)

print("Seeding complete! Default password for all is: password123")
