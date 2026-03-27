import re

def validate_email(email):
    """Check email looks like a real email"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password must be at least 6 characters"""
    return len(password) >= 6

def validate_required_fields(data, fields):
    """Check all required fields are present"""
    missing = []
    for field in fields:
        if field not in data or not data[field]:
            missing.append(field)
    return missing