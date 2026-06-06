import os
import boto3

REGION = "us-east-1"

# Initialize Bedrock Runtime client
bedrock_runtime = boto3.client("bedrock-runtime", region_name=REGION)

def get_bedrock_client():
    """
    Returns the Bedrock runtime client.
    """
    return bedrock_runtime
