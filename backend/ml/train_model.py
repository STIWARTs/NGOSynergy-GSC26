from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import pandas as pd

# Load the synthetic data
df = pd.read_csv('volunteer_training.csv')

# Separate features (X) and target (y)
X = df.drop(['priority_label', 'priority_score'], axis=1)
y = df['priority_label']

# Split into training (80%) and testing (20%) sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train Random Forest model
model = RandomForestClassifier(
    n_estimators=100,      # Number of decision trees
    max_depth=10,          # Prevent overfitting
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate model performance
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"[SUCCESS] Model trained successfully!")
print(f"\nAccuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model for later use
joblib.dump(model, 'volunteer_model.pkl')
print("\nModel saved as volunteer_model.pkl")
