// test.js - Test script for Data Digitization Pipeline
import { processText } from "./main.js";
import { preprocess, enhanceText, normalizeCategory } from "./main.js";

// Sample crisis report text for testing
const sampleText = `
Emergency Field Report - Village A

Date: 2026-04-23
Location: Village A, District B

CRITICAL SITUATION:
Severe water shortage has been affecting the community for the past 3 weeks. 
Approximately 120 people including 45 children are without access to clean drinking water.

The nearest water source is 8 kilometers away and the road is damaged due to recent flooding.

URGENT NEEDS:
- Clean drinking water supply
- Water purification tablets
- Medical assistance for waterborne diseases

IMMEDIATE ACTION REQUIRED:
Water trucks needed urgently. Health team should assess disease outbreak risk.

Reported by: Field Worker John
Contact: +1234567890
`;

console.log("=".repeat(60));
console.log("🧪 TESTING DATA DIGITIZATION PIPELINE");
console.log("=".repeat(60));

// Test 1: Preprocessing
console.log("\n📝 Test 1: Text Preprocessing");
console.log("-".repeat(60));
const preprocessed = preprocess(sampleText);
console.log(`✅ Preprocessed text length: ${preprocessed.length} characters`);
console.log(`📄 Preview: ${preprocessed.substring(0, 100)}...`);

// Test 2: Category Normalization
console.log("\n📝 Test 2: Category Normalization");
console.log("-".repeat(60));
const detectedCategory = normalizeCategory(sampleText);
console.log(`✅ Detected category: ${detectedCategory}`);

// Test 3: Enhanced Text
console.log("\n📝 Test 3: Text Enhancement");
console.log("-".repeat(60));
const { text: enhanced, metadata } = enhanceText(sampleText);
console.log(`✅ Enhanced text metadata:`);
console.log(`   - Original length: ${metadata.originalLength}`);
console.log(`   - Cleaned length: ${metadata.cleanedLength}`);
console.log(`   - Word count: ${metadata.wordCount}`);
console.log(`   - Detected category: ${metadata.detectedCategory}`);
console.log(`   - Extracted numbers: ${metadata.extractedNumbers.join(", ")}`);

// Test 4: Full Pipeline (Text Processing)
console.log("\n📝 Test 4: Full Pipeline (Text Processing)");
console.log("-".repeat(60));
console.log("⚠️  This will call Gemini AI and Firestore...");
console.log("⚠️  Make sure your .env file is configured correctly!\n");

// Uncomment to run full pipeline (requires valid .env)
/*
processText(sampleText)
  .then((result) => {
    console.log("✅ Pipeline completed successfully!");
    console.log("\n📊 Result:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error("❌ Pipeline failed:", error.message);
  });
*/

console.log("\n💡 To run the full pipeline:");
console.log("   1. Update .env file with your Google Cloud credentials");
console.log("   2. Uncomment the processText() call above");
console.log("   3. Run: node test.js\n");

console.log("=".repeat(60));
console.log("✅ Basic tests completed successfully!");
console.log("=".repeat(60));
