import boto3
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT", "http://localhost:8000")

if ENDPOINT:
    dynamodb = boto3.resource('dynamodb', region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource('dynamodb', region_name=REGION)

TABLES = {
    'rb_users': 'user_id',
    'rb_requests': 'request_id',
    'rb_donations': 'donation_id',
    'rb_schedules': 'schedule_id'
}

def reset_db():
    print(f"Warning: This will delete ALL data from {len(TABLES)} tables in {ENDPOINT}.")
    confirmation = input("Are you sure you want to reset the database for the demo? (yes/no): ")
    if confirmation.lower() != 'yes':
        print("Aborted.")
        return
        
    for table_name, pk in TABLES.items():
        try:
            table = dynamodb.Table(table_name)
            scan = table.scan()
            with table.batch_writer() as batch:
                for each in scan.get('Items', []):
                    batch.delete_item(Key={pk: each[pk]})
            print(f"Cleared table: {table_name}")
        except Exception as e:
            print(f"Failed to clear {table_name}: {e}")
            
    print("\nDatabase reset complete! It is now clean for your demo.")

if __name__ == "__main__":
    reset_db()
