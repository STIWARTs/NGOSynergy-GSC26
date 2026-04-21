import joblib
import numpy as np
import pandas as pd

# Load the trained model
model = joblib.load('volunteer_model.pkl')

# Simulate new volunteer profiles
test_volunteers = [
    {
        'name': 'Volunteer A - Perfect Match',
        'features': [0.95, 2.0, 24, 0.98, 1]  # High skill, close, reliable, certified
    },
    {
        'name': 'Volunteer B - Far but Skilled',
        'features': [0.90, 25.0, 12, 0.85, 1]  # High skill, far, certified
    },
    {
        'name': 'Volunteer C - Close but Unskilled',
        'features': [0.30, 3.0, 8, 0.70, 0]  # Low skill, close, not certified
    },
    {
        'name': 'Volunteer D - Average',
        'features': [0.65, 10.0, 16, 0.75, 0]  # Medium across the board
    }
]

print("🧪 Testing Volunteer Rankings:\n")

results = []
for volunteer in test_volunteers:
    # Get prediction probability
    proba = model.predict_proba([volunteer['features']])
    priority_confidence = proba[0][1] * 100  # Probability of being high priority
    
    results.append({
        'name': volunteer['name'],
        'confidence': priority_confidence
    })
    
    print(f"{volunteer['name']}")
    print(f"  Priority Confidence: {priority_confidence:.2f}%")
    print()

# Sort by confidence (highest first)
results_df = pd.DataFrame(results).sort_values('confidence', ascending=False)
print("🏆 Final Ranking:")
print(results_df.to_string(index=False))
