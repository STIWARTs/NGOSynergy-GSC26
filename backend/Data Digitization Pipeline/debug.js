// debug.js - Check if .env is loading correctly
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from THIS directory (same as config.js)
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Checking environment variables...\n");

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("Length:", process.env.GEMINI_API_KEY?.length);
console.log("Starts with AIzaSy:", process.env.GEMINI_API_KEY?.startsWith("AIzaSyDdGL"));
console.log("\nFull key:", JSON.stringify(process.env.GEMINI_API_KEY));
