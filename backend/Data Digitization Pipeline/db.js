// src/db.js
import { Firestore } from "@google-cloud/firestore";

// Initialize Firestore with explicit credentials from .env
let db;

try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Use Firebase Admin SDK credentials
    db = new Firestore({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
    console.log("✅ Firestore initialized with Firebase credentials");
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account key file
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log("✅ Firestore initialized with service account key file");
  } else {
    // Try default credentials (for local development with gcloud auth)
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    console.log("⚠️  Firestore initialized with default credentials");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firestore:", error.message);
  // Create a mock DB for testing
  db = {
    collection: () => ({
      add: async (data) => {
        console.log("\n📝 Mock Firestore - Would save:", JSON.stringify(data, null, 2));
        return { id: "mock-test-id-12345" };
      },
    }),
  };
  console.log("⚠️  Using mock Firestore (data will not be saved)");
}

/**
 * Save crisis report to Firestore
 * @param {Object} data - Validated and transformed crisis data
 * @param {string} rawText - Original extracted text
 * @returns {Promise<string>} Document ID
 */
export async function saveToDB(data, rawText) {
  try {
    console.log("Saving to Firestore...");

    const docData = {
      ...data,
      originalText: rawText,
      status: data.status || "pending",
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("crises").add(docData);

    console.log(`Saved to Firestore with ID: ${docRef.id}`);

    return docRef.id;
  } catch (error) {
    console.error("Firestore Error:", error.message);
    throw new Error(`Failed to save to database: ${error.message}`);
  }
}

/**
 * Get crisis report by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Crisis data or null
 */
export async function getFromDB(id) {
  try {
    const docRef = db.collection("crises").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Firestore Read Error:", error.message);
    throw new Error(`Failed to read from database: ${error.message}`);
  }
}

/**
 * Get all crisis reports with optional filtering
 * @param {Object} filters - Optional filters (status, category, etc.)
 * @returns {Promise<Array>} Array of crisis reports
 */
export async function getAllFromDB(filters = {}) {
  try {
    let query = db.collection("crises");

    // Apply filters
    if (filters.status) {
      query = query.where("status", "==", filters.status);
    }
    if (filters.category) {
      query = query.where("category", "==", filters.category);
    }
    if (filters.minSeverity) {
      query = query.where("severity", ">=", filters.minSeverity);
    }

    // Order by priority score (highest first)
    query = query.orderBy("priorityScore", "desc");

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Firestore Query Error:", error.message);
    throw new Error(`Failed to query database: ${error.message}`);
  }
}

/**
 * Update crisis report status
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateInDB(id, updates) {
  try {
    const docRef = db.collection("crises").doc(id);
    await docRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    console.log(`Updated document ${id}`);
  } catch (error) {
    console.error("Firestore Update Error:", error.message);
    throw new Error(`Failed to update database: ${error.message}`);
  }
}
