import boto3
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

endpoint = os.getenv("DYNAMODB_ENDPOINT")
if endpoint:
    dynamodb = boto3.client('dynamodb', region_name='us-east-1', endpoint_url=endpoint)
else:
    dynamodb = boto3.client('dynamodb', region_name='us-east-1')

def create_rb_users():
    try:
        response = dynamodb.create_table(
            TableName='rb_users',
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'email', 'AttributeType': 'S'},
                {'AttributeName': 'role', 'AttributeType': 'S'},
                {'AttributeName': 'city', 'AttributeType': 'S'},
                {'AttributeName': 'blood_group', 'AttributeType': 'S'},
                {'AttributeName': 'status', 'AttributeType': 'S'}
            ],
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'email-index',
                    'KeySchema': [{'AttributeName': 'email', 'KeyType': 'HASH'}],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'role-index',
                    'KeySchema': [
                        {'AttributeName': 'role', 'KeyType': 'HASH'},
                        {'AttributeName': 'city', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'bloodgroup-status-index',
                    'KeySchema': [
                        {'AttributeName': 'blood_group', 'KeyType': 'HASH'},
                        {'AttributeName': 'status', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        print("Creating table rb_users...")
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName='rb_users')
        print("Table rb_users created successfully.")
    except dynamodb.exceptions.ResourceInUseException:
        print("Table rb_users already exists.")

if __name__ == '__main__':
    create_rb_users()
