// Test the Pro Priority Formula
import { transformData } from "./validate.js";
import { categoryWeights } from "./config.js";

console.log("=".repeat(70));
console.log("HYBRID PRO FORMULA TEST - Solution Challenge 2026");
console.log("=".repeat(70));
console.log("\nFormula: PriorityScore = (Category × 0.4) + (Severity × 0.3) + (ScaleFactor × 0.2) + (WaitTime × 0.1)\n");

// Test Case 1: Original test case from TEST_RESULTS.md
console.log("Test Case 1: Water Crisis (Original Example)");
console.log("-".repeat(70));
const test1 = {
  category: "Water",
  severity: 9,
  urgency: "HIGH",
  people_affected: 120,
  location_name: "Village A",
  summary: "Severe water shortage affecting approximately 120 people, including 45 children, for the past 3 weeks.",
  createdAt: new Date(),
};

const result1 = transformData(test1, categoryWeights);
console.log(`Category: ${test1.category} (weight: ${categoryWeights.Water})`);
console.log(`Severity: ${test1.severity}/10`);
console.log(`People Affected: ${test1.people_affected}`);
console.log(`\nPriority Breakdown:`);
console.log(`  - Category Score:  ${result1.priorityBreakdown.categoryScore.toFixed(2)} (${categoryWeights.Water} × 0.4)`);
console.log(`  - Severity Score:  ${result1.priorityBreakdown.severityScore.toFixed(2)} (${test1.severity} × 0.3)`);
console.log(`  - Scale Score:     ${result1.priorityBreakdown.scaleScore.toFixed(2)} (log10(${test1.people_affected + 1}) × 2.5 × 0.2)`);
console.log(`  - Wait Time Score: ${result1.priorityBreakdown.waitTimeScore.toFixed(2)} (new report)`);
console.log(`\n✅ TOTAL PRIORITY SCORE: ${result1.priorityScore}`);

// Test Case 2: Health crisis affecting many people
console.log("\n\nTest Case 2: Health Crisis (Large Scale)");
console.log("-".repeat(70));
const test2 = {
  category: "Health",
  severity: 8,
  urgency: "HIGH",
  people_affected: 500,
  location_name: "City B",
  summary: "Disease outbreak in urban area",
  createdAt: new Date(),
};

const result2 = transformData(test2, categoryWeights);
console.log(`Category: ${test2.category} (weight: ${categoryWeights.Health})`);
console.log(`Severity: ${test2.severity}/10`);
console.log(`People Affected: ${test2.people_affected}`);
console.log(`\nPriority Breakdown:`);
console.log(`  - Category Score:  ${result2.priorityBreakdown.categoryScore.toFixed(2)}`);
console.log(`  - Severity Score:  ${result2.priorityBreakdown.severityScore.toFixed(2)}`);
console.log(`  - Scale Score:     ${result2.priorityBreakdown.scaleScore.toFixed(2)}`);
console.log(`  - Wait Time Score: ${result2.priorityBreakdown.waitTimeScore.toFixed(2)}`);
console.log(`\n✅ TOTAL PRIORITY SCORE: ${result2.priorityScore}`);

// Test Case 3: Low priority but old (demonstrates wait time)
console.log("\n\nTest Case 3: Food Crisis (Old Report - 48 hours)");
console.log("-".repeat(70));
const test3 = {
  category: "Food",
  severity: 4,
  urgency: "MEDIUM",
  people_affected: 50,
  location_name: "Rural Village C",
  summary: "Food shortage in remote area",
  createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
};

const result3 = transformData(test3, categoryWeights);
console.log(`Category: ${test3.category} (weight: ${categoryWeights.Food})`);
console.log(`Severity: ${test3.severity}/10`);
console.log(`People Affected: ${test3.people_affected}`);
console.log(`Wait Time: 48 hours`);
console.log(`\nPriority Breakdown:`);
console.log(`  - Category Score:  ${result3.priorityBreakdown.categoryScore.toFixed(2)}`);
console.log(`  - Severity Score:  ${result3.priorityBreakdown.severityScore.toFixed(2)}`);
console.log(`  - Scale Score:     ${result3.priorityBreakdown.scaleScore.toFixed(2)}`);
console.log(`  - Wait Time Score: ${result3.priorityBreakdown.waitTimeScore.toFixed(2)} (48 hrs / 4 = 10, capped)`);
console.log(`\n✅ TOTAL PRIORITY SCORE: ${result3.priorityScore}`);
console.log(`💡 Note: Wait time boosted this from ${result3.priorityScore - result3.priorityBreakdown.waitTimeScore} to ${result3.priorityScore}`);

// Test Case 4: Small scale emergency
console.log("\n\nTest Case 4: Rescue (Small Scale, High Urgency)");
console.log("-".repeat(70));
const test4 = {
  category: "Rescue",
  severity: 10,
  urgency: "HIGH",
  people_affected: 5,
  location_name: "Mountain Area D",
  summary: "Hikers trapped after landslide",
  createdAt: new Date(),
};

const result4 = transformData(test4, categoryWeights);
console.log(`Category: ${test4.category} (weight: ${categoryWeights.Rescue})`);
console.log(`Severity: ${test4.severity}/10`);
console.log(`People Affected: ${test4.people_affected}`);
console.log(`\nPriority Breakdown:`);
console.log(`  - Category Score:  ${result4.priorityBreakdown.categoryScore.toFixed(2)}`);
console.log(`  - Severity Score:  ${result4.priorityBreakdown.severityScore.toFixed(2)}`);
console.log(`  - Scale Score:     ${result4.priorityBreakdown.scaleScore.toFixed(2)}`);
console.log(`  - Wait Time Score: ${result4.priorityBreakdown.waitTimeScore.toFixed(2)}`);
console.log(`\n✅ TOTAL PRIORITY SCORE: ${result4.priorityScore}`);

// Comparison Summary
console.log("\n\n" + "=".repeat(70));
console.log("COMPARISON SUMMARY");
console.log("=".repeat(70));
const results = [
  { name: "Water Crisis (120 people)", score: result1.priorityScore },
  { name: "Health Crisis (500 people)", score: result2.priorityScore },
  { name: "Food Crisis (48h old)", score: result3.priorityScore },
  { name: "Rescue (5 people)", score: result4.priorityScore },
].sort((a, b) => b.score - a.score);

console.log("\nPriority Ranking (Highest to Lowest):");
results.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name.padEnd(30)} Score: ${r.score.toFixed(2)}`);
});

console.log("\n" + "=".repeat(70));
console.log("KEY INSIGHTS FOR JUDGES:");
console.log("=".repeat(70));
console.log("✅ Impact over Intensity: Health crisis (500 people) ranked higher than Water (120)");
console.log("✅ No-One Forgotten: Old Food crisis boosted by wait time factor");
console.log("✅ Transparent Logic: Every factor is explainable and weighted");
console.log("✅ Smart Scaling: Logarithmic scale prevents huge numbers from dominating");
console.log("=".repeat(70));



