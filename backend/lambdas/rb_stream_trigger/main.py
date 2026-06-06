import json
import boto3
import os

state_machine_arn = os.environ.get('STATE_MACHINE_ARN')
# We need to pass STATE_MACHINE_ARN to this lambda. I'll need to update template.yaml to inject it.
# Actually I'll use boto3 to find it or expect it in env.

def handler(event, context):
    print("Received DynamoDB Stream event:", json.dumps(event))
    step_functions = boto3.client('stepfunctions')
    
    # In a real deployed environment, we inject STATE_MACHINE_ARN via template.yaml environment variables
    # For local testing, we might need a dummy or dynamic fetch.
    sm_arn = os.environ.get('STATE_MACHINE_ARN', 'arn:aws:states:us-east-1:089679768296:stateMachine:OutreachStateMachine')
    
    for record in event.get('Records', []):
        if record['eventName'] == 'INSERT':
            new_image = record['dynamodb']['NewImage']
            
            # Extract request details
            request_id = new_image.get('request_id', {}).get('S')
            patient_id = new_image.get('patient_id', {}).get('S')
            is_thalassemia = new_image.get('is_thalassemia', {}).get('BOOL', False)
            
            # Payload for Step Functions
            payload = {
                "request_id": request_id,
                "patient_id": patient_id,
                "is_thalassemia_request": is_thalassemia,
                "batch_index": 0
            }
            
            try:
                print(f"Starting State Machine for Request {request_id}")
                response = step_functions.start_execution(
                    stateMachineArn=sm_arn,
                    name=f"Request_{request_id}_{context.aws_request_id}",
                    input=json.dumps(payload)
                )
                print("State Machine started:", response['executionArn'])
            except Exception as e:
                print("Failed to start state machine:", e)
                
    return {"statusCode": 200, "body": "Success"}
