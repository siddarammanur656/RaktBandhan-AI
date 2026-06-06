import boto3
import time

sagemaker = boto3.client('sagemaker', region_name='us-east-1')
role = 'arn:aws:iam::089679768296:role/SageMakerExecutionRole-RaktBandhan'
model_url = 's3://raktbandhan-ml-models-061/model.tar.gz'
model_name = 'raktbandhan-donor-prediction-model'

# Scikit-Learn image URI for us-east-1
container = '683313688378.dkr.ecr.us-east-1.amazonaws.com/sagemaker-scikit-learn:1.2-1-cpu-py3'

print("Creating model...")
try:
    sagemaker.delete_model(ModelName=model_name)
except Exception:
    pass

sagemaker.create_model(
    ModelName=model_name,
    ExecutionRoleArn=role,
    PrimaryContainer={
        'Image': container,
        'ModelDataUrl': model_url,
        'Environment': {
            'SAGEMAKER_PROGRAM': 'inference.py',
            'SAGEMAKER_SUBMIT_DIRECTORY': model_url
        }
    }
)

print("Creating endpoint config...")
config_name = 'raktbandhan-donor-prediction-config'
try:
    sagemaker.delete_endpoint_config(EndpointConfigName=config_name)
except Exception:
    pass

sagemaker.create_endpoint_config(
    EndpointConfigName=config_name,
    ProductionVariants=[
        {
            'VariantName': 'AllTraffic',
            'ModelName': model_name,
            'ServerlessConfig': {
                'MemorySizeInMB': 2048,
                'MaxConcurrency': 1
            }
        }
    ]
)

print("Creating endpoint...")
endpoint_name = 'raktbandhan-donor-prediction-endpoint'
try:
    sagemaker.delete_endpoint(EndpointName=endpoint_name)
    time.sleep(10)
except Exception:
    pass

sagemaker.create_endpoint(
    EndpointName=endpoint_name,
    EndpointConfigName=config_name
)

print("Waiting for endpoint to be InService...")
while True:
    resp = sagemaker.describe_endpoint(EndpointName=endpoint_name)
    status = resp['EndpointStatus']
    print(f"Status: {status}")
    if status == 'InService':
        print("Endpoint is ready!")
        break
    elif status == 'Failed':
        print(f"Endpoint creation failed: {resp.get('FailureReason')}")
        break
    time.sleep(30)
