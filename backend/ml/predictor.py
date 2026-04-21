import joblib
import json
import sys

# Load the trained model
try:
    model = joblib.load('volunteer_model.pkl')
except FileNotFoundError:
    print("Error: volunteer_model.pkl not found", file=sys.stderr)
    sys.exit(1)

# Read feature vectors from stdin
try:
    input_data = sys.stdin.read()
    features_list = json.loads(input_data)
except json.JSONDecodeError:
    print("Error: Invalid JSON input", file=sys.stderr)
    sys.exit(1)

# Make predictions
try:
    # Extract feature vectors in correct order
    feature_matrix = []
    for features in features_list:
        feature_vector = [
            features['skill_match_score'],
            features['distance_km'],
            features['availability_hrs'],
            features['reliability_rating'],
            features['is_certified']
        ]
        feature_matrix.append(feature_vector)
    
    # Get probability predictions
    predictions = model.predict_proba(feature_matrix)
    
    # Output predictions as JSON (probability of high priority class)
    result = [{'score': float(pred[1])} for pred in predictions]
    print(json.dumps(result))
    
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
