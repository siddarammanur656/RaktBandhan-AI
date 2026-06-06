import csv
import os
import boto3
import reverse_geocoder as rg
from decimal import Decimal
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

endpoint = os.getenv("DYNAMODB_ENDPOINT")
if endpoint:
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1', endpoint_url=endpoint)
else:
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    
users_table = dynamodb.Table('rb_users')

def load_data():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'blood_donors.csv')
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return
        
    print(f"Reading data from {data_path}...")
    
    with open(data_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    # Extract 50 valid, unique donors
    valid_rows = []
    seen_users = set()
    for row in rows:
        if row.get('latitude') and row.get('longitude') and row.get('user_id'):
            # The dataset has user_ids that start with \x, let's clean them up
            user_id = row['user_id'].replace('\\x', '').strip()
            if user_id and user_id not in seen_users:
                row['clean_user_id'] = user_id
                valid_rows.append(row)
                seen_users.add(user_id)
            if len(valid_rows) >= 50:
                break
                
    if not valid_rows:
        print("No valid rows found.")
        return
        
    print("Batch geocoding locations...")
    coords = [(float(r['latitude']), float(r['longitude'])) for r in valid_rows]
    locations = rg.search(coords)
    
    print(f"Loading {len(valid_rows)} users into DynamoDB table 'rb_users'...")
    
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    with users_table.batch_writer() as batch:
        for row, loc in zip(valid_rows, locations):
            city = loc.get('name', 'Unknown')
            area = loc.get('admin2', city)
            
            user_id_short = row['clean_user_id'][:8]
            
            item = {
                'user_id': row['clean_user_id'],
                'email': f"{user_id_short}@example.com",
                'name': f"Donor {user_id_short}",
                'phone': '+910000000000',
                'role': 'donor',
                'blood_group': row.get('blood_group', 'O Positive'),
                'gender': row.get('gender', 'Unknown'),
                'latitude': Decimal(str(row['latitude'])),
                'longitude': Decimal(str(row['longitude'])),
                'city': city,
                'area': area,
                'donor_type': row.get('donor_type', 'Regular Donor'),
                'reliability_score': Decimal(str(85)),
                'tier': 'Silver',
                'total_donations': Decimal(str(row.get('donations_till_date', 0) or 0)),
                'total_calls': Decimal(str(row.get('total_calls', 0) or 0)),
                'donated_count': Decimal(str(row.get('donations_till_date', 0) or 0)),
                'status': 'active',
                'consent_email': True,
                'created_at': now_iso,
                'updated_at': now_iso
            }
            batch.put_item(Item=item)
            
    print("Data loading complete. Successfully inserted ~50 donors.")

if __name__ == "__main__":
    load_data()
