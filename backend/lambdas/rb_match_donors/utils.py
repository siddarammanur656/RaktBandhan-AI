import math
from datetime import datetime

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points on the earth."""
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371 # Radius of earth in kilometers
    return c * r

def is_blood_compatible(donor_blood: str, patient_blood: str) -> bool:
    """
    Returns True if donor_blood can be transfused into patient_blood.
    Using standard ABO and Rh compatibility rules.
    """
    compatibility_chart = {
        "O Negative": ["O Negative", "O Positive", "A Negative", "A Positive", "B Negative", "B Positive", "AB Negative", "AB Positive"],
        "O Positive": ["O Positive", "A Positive", "B Positive", "AB Positive"],
        "A Negative": ["A Negative", "A Positive", "AB Negative", "AB Positive"],
        "A Positive": ["A Positive", "AB Positive"],
        "B Negative": ["B Negative", "B Positive", "AB Negative", "AB Positive"],
        "B Positive": ["B Positive", "AB Positive"],
        "AB Negative": ["AB Negative", "AB Positive"],
        "AB Positive": ["AB Positive"]
    }
    
    # Check if patient is in the list of compatible recipients for this donor
    allowed_recipients = compatibility_chart.get(donor_blood, [])
    return patient_blood in allowed_recipients

def calculate_reliability_score(base_score: int, total_donations: int, last_donation_date_str: str) -> int:
    """
    Calculates a dynamic reliability score.
    Base score is usually 50 for new users.
    Total donations increases score.
    Recent donations slightly increase score.
    """
    score = base_score
    
    # +5 points per past successful donation
    score += (total_donations * 5)
    
    # Bonus for recent activity (within last year)
    if last_donation_date_str:
        try:
            last_date = datetime.strptime(last_donation_date_str, "%Y-%m-%d")
            days_since = (datetime.utcnow() - last_date).days
            if days_since < 365:
                score += 10
        except ValueError:
            pass
            
    # Cap at 100
    return min(100, max(0, score))

def get_tier(reliability_score: int) -> str:
    """Returns a tier based on reliability score."""
    if reliability_score >= 90: return "Gold"
    if reliability_score >= 70: return "Silver"
    return "Bronze"
