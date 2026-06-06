import os
import boto3
from dotenv import load_dotenv

load_dotenv()

# Use the hardcoded region per instructions
REGION = os.getenv("AWS_REGION", "us-east-1")
ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")

# Initialize DynamoDB resource
if ENDPOINT:
    dynamodb = boto3.resource("dynamodb", region_name=REGION, endpoint_url=ENDPOINT)
else:
    dynamodb = boto3.resource("dynamodb", region_name=REGION)

def get_table(table_name: str):
    """
    Returns a DynamoDB Table resource.
    """
    return dynamodb.Table(table_name)
