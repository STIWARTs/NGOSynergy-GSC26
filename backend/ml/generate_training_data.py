import pandas as pd
import numpy as np

# Generate 1000 records to train the model
n_samples = 1000

data = {
    'skill_match_score': np.random.uniform(0, 1, n_samples),      # 0-1: Keyword match
    'distance_km': np.random.uniform(0.5, 30, n_samples),         # 0.5-30km from crisis
    'availability_hrs': np.random.randint(1, 48, n_samples),      # 1-48 hours available
    'reliability_rating': np.random.uniform(0.5, 1.0, n_samples), # 0.5-1.0 past performance
    'is_certified': np.random.choice([0, 1], n_samples)           # Binary: certified or not
}

df = pd.DataFrame(data)

# Add realistic correlations
# Certified volunteers tend to be more reliable
df.loc[df['is_certified'] == 1, 'reliability_rating'] += np.random.uniform(0, 0.15, (df['is_certified'] == 1).sum())
df['reliability_rating'] = df['reliability_rating'].clip(0, 1)

# Closer volunteers respond faster
df['availability_hrs'] = np.where(
    df['distance_km'] < 5,
    np.random.randint(1, 12, n_samples),  # Quick response
    np.random.randint(6, 48, n_samples)   # Slower response
)

# Calculate priority label (target variable the AI learns)
# Formula weights:
# - 40% skill match
# - 30% proximity (inverse distance)
# - 20% reliability
# - 10% certification
df['priority_score'] = (
    (df['skill_match_score'] * 0.4) + 
    ((1 - (df['distance_km'] / 30)) * 0.3) + 
    (df['reliability_rating'] * 0.2) + 
    (df['is_certified'] * 0.1)
)

# Convert to binary classification: 1 = High Priority, 0 = Low Priority
df['priority_label'] = (df['priority_score'] > 0.7).astype(int)

# Save training dataset
df.to_csv('volunteer_training.csv', index=False)
print("[SUCCESS] Dataset created: volunteer_training.csv")
print(f"Summary - High Priority: {df['priority_label'].sum()} | Low Priority: {(~df['priority_label'].astype(bool)).sum()}")
print(f"Total samples: {len(df)}")
