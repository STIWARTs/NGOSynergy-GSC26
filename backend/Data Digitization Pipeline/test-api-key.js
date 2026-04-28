// test-api-key.js - Direct test of Gemini API key
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

console.log("Testing Gemini API Key directly...\n");
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY env var.");
  process.exit(1);
}

console.log("API Key:", API_KEY.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("\nSending test request to Gemini...");
    
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ SUCCESS! Gemini responded:", text);
    console.log("\nYour API key is working correctly!");
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    console.log("\nTroubleshooting:");
    console.log("1. Go to: https://aistudio.google.com/apikey");
    console.log("2. Check if this API key exists and is active");
    console.log("3. Make sure Gemini API is enabled in Google Cloud Console");
    console.log("4. Try creating a NEW API key");
  }
}

testAPI();
