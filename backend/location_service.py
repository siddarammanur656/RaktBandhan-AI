import boto3
import os
import json

LOCATION_CLIENT = boto3.client('location', region_name=os.getenv("AWS_REGION", "us-east-1"))
INDEX_NAME = "RaktBandhanIndex"

def reverse_geocode(lat: float, lng: float):
    """Converts Latitude/Longitude into City and Area using AWS Location Service."""
    try:
        response = LOCATION_CLIENT.search_place_index_for_position(
            IndexName=INDEX_NAME,
            Position=[lng, lat]
        )
        if response.get('Results'):
            place = response['Results'][0]['Place']
            city = place.get('Municipality') or place.get('SubRegion') or place.get('Region') or "Unknown"
            area = place.get('Neighborhood') or place.get('Label') or city
            return city, area
    except Exception as e:
        print(f"Reverse geocode error: {e}")
    return "Unknown", "Unknown"

def forward_geocode(address_text: str):
    """Converts a City/Address text into Latitude and Longitude using AWS Location Service."""
    if not address_text:
        return 0.0, 0.0
    try:
        response = LOCATION_CLIENT.search_place_index_for_text(
            IndexName=INDEX_NAME,
            Text=address_text
        )
        if response.get('Results'):
            place = response['Results'][0]['Place']
            position = place.get('Geometry', {}).get('Point')
            if position:
                # AWS returns [Longitude, Latitude]
                return position[1], position[0]
    except Exception as e:
        print(f"Forward geocode error: {e}")
    return 0.0, 0.0
