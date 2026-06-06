import os
import sys
import shutil
import subprocess
import time
import json
import boto3
from pathlib import Path

REGION = "us-east-1"
FUNCTION_NAME = "RaktBandhanAPI"
ROLE_NAME = "RaktBandhanLambdaRole"
ZIP_NAME = "backend_deployment.zip"

def main():
    print("Starting RaktBandhan AWS Deployment via Boto3...\n")
    
    # Initialize AWS Clients
    try:
        iam = boto3.client('iam', region_name=REGION)
        lambda_client = boto3.client('lambda', region_name=REGION)
    except Exception as e:
        print(f"AWS Credentials error: {e}")
        return

    # 1. Setup IAM Role
    print("Checking IAM Role...")
    try:
        role = iam.get_role(RoleName=ROLE_NAME)
        role_arn = role['Role']['Arn']
        print(f"Found existing role: {ROLE_NAME}")
    except iam.exceptions.NoSuchEntityException:
        print(f"Creating new IAM Role: {ROLE_NAME}...")
        role = iam.create_role(
            RoleName=ROLE_NAME,
            AssumeRolePolicyDocument=json.dumps({
                "Version": "2012-10-17",
                "Statement": [{
                    "Action": "sts:AssumeRole",
                    "Principal": { "Service": "lambda.amazonaws.com" },
                    "Effect": "Allow"
                }]
            })
        )
        role_arn = role['Role']['Arn']
        iam.attach_role_policy(RoleName=ROLE_NAME, PolicyArn='arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess')
        iam.attach_role_policy(RoleName=ROLE_NAME, PolicyArn='arn:aws:iam::aws:policy/AmazonBedrockFullAccess')
        iam.attach_role_policy(RoleName=ROLE_NAME, PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole')
        
        print("Waiting 15 seconds for IAM Role permissions to propagate...")
        time.sleep(15)

    # 2. Package the Application
    print("\nPackaging Application...")
    build_dir = Path("build_pkg")
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir()

    # Install requirements using the active python environment
    print("Installing dependencies...")
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", 
        "-r", "requirements.txt", 
        "-t", str(build_dir), 
        "--no-cache-dir",
        "--platform", "manylinux2014_x86_64",
        "--implementation", "cp",
        "--python-version", "3.10",
        "--only-binary=:all:"
    ])

    # Copy our application code
    print("Copying source code...")
    # Core files
    shutil.copy("run_local.py", build_dir / "run_local.py")
    # Lambdas directory
    shutil.copytree("lambdas", build_dir / "lambdas")
    
    # Zip it up
    print("Zipping deployment package...")
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)
    shutil.make_archive(ZIP_NAME.replace('.zip', ''), 'zip', build_dir)
    
    # Clean up build dir to save space
    shutil.rmtree(build_dir)

    # 3. Deploy to AWS Lambda
    print("\nDeploying to AWS Lambda...")
    with open(ZIP_NAME, 'rb') as f:
        zipped_code = f.read()

    try:
        # Check if function exists
        lambda_client.get_function(FunctionName=FUNCTION_NAME)
        print("Updating existing Lambda function code...")
        lambda_client.update_function_code(
            FunctionName=FUNCTION_NAME,
            ZipFile=zipped_code
        )
        # Wait for update to complete
        waiter = lambda_client.get_waiter('function_updated_v2')
        waiter.wait(FunctionName=FUNCTION_NAME)
    except lambda_client.exceptions.ResourceNotFoundException:
        print("Creating new Lambda function...")
        lambda_client.create_function(
            FunctionName=FUNCTION_NAME,
            Runtime='python3.10',
            Role=role_arn,
            Handler='run_local.handler', # Mangum adapter entry point
            Code={'ZipFile': zipped_code},
            Timeout=30,
            MemorySize=512
        )
        # Wait for create to complete
        waiter = lambda_client.get_waiter('function_active_v2')
        waiter.wait(FunctionName=FUNCTION_NAME)

    # 4. Configure Lambda Function URL (Instead of complex API Gateway)
    print("\nConfiguring Public Function URL...")
    try:
        url_config = lambda_client.create_function_url_config(
            FunctionName=FUNCTION_NAME,
            AuthType='NONE',
            Cors={
                'AllowOrigins': ['*'],
                'AllowMethods': ['*'],
                'AllowHeaders': ['*'],
                'MaxAge': 86400
            }
        )
        function_url = url_config['FunctionUrl']
        
        # Grant public invoke permission
        try:
            lambda_client.add_permission(
                FunctionName=FUNCTION_NAME,
                StatementId='FunctionURLAllowPublicAccess',
                Action='lambda:InvokeFunctionUrl',
                Principal='*',
                FunctionUrlAuthType='NONE'
            )
        except lambda_client.exceptions.ResourceConflictException:
            pass # Permission already exists
            
    except lambda_client.exceptions.ResourceConflictException:
        # URL already exists, just get it
        url_config = lambda_client.get_function_url_config(FunctionName=FUNCTION_NAME)
        function_url = url_config['FunctionUrl']

    print(f"\nDEPLOYMENT SUCCESSFUL!")
    print(f"Live API Endpoint: {function_url}")
    print(f"Update your frontend/.env.local VITE_API_BASE_URL to this link!")

if __name__ == "__main__":
    main()
