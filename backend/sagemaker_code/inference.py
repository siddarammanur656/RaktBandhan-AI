import os
import joblib
import pandas as pd
import json

def model_fn(model_dir):
    """
    Load the model for inference
    """
    model_path = os.path.join(model_dir, "donor_prediction_model.pkl")
    print(f"Loading model from {model_path}")
    model = joblib.load(model_path)
    return model

def input_fn(request_body, request_content_type):
    """
    Deserialize the request body
    """
    if request_content_type == 'application/json':
        input_data = json.loads(request_body)
        return pd.DataFrame(input_data)
    else:
        raise ValueError("This model only supports application/json input")

def predict_fn(input_data, model):
    """
    Make predictions against the loaded model
    """
    predictions = model.predict_proba(input_data)
    return predictions

def output_fn(prediction, accept):
    """
    Serialize the prediction
    """
    if accept == 'application/json':
        return json.dumps(prediction.tolist())
    raise ValueError("This model only supports application/json output")
