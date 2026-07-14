import fs from "node:fs";
import path from "node:path";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";

async function main() {
  console.log("🎯 Task 2: One-Shot Prompting");
  console.log("=".repeat(50));

  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "gemma4:cloud",
    temperature: 0.7,
  });

  console.log("\n📝 Creating One-Shot Template with Example");
  console.log("-".repeat(40));

  const examplePolicy =
    "REFUND POLICY\n1. Eligibility: Within 30 days of purchase\n2. Conditions: Product unused and in original packaging\n3. Process: Submit request via support@company.com\n4. Timeline: Refund processed within 5-7 business days\n5. Exceptions: Digital products and custom orders non-refundable";

  console.log("📋 Example provided:");
  console.log(examplePolicy);

  const oneShotTemplate = PromptTemplate.fromTemplate(
    "Here's an example of our policy format:\n\n{example}\n\nNow write a {policy_type} policy following this EXACT format with numbered sections:",
  );

  console.log("\n🔄 Testing One-Shot Prompting");
  console.log("-".repeat(40));

  const formattedPrompt = await oneShotTemplate.format({
    example: examplePolicy,
    policy_type: "remote work",
  });

  console.log("📤 Sending one-shot prompt for: remote work policy");

  const response = await llm.invoke(formattedPrompt);
  const responseContent = response.content;
  console.log(`\n📥 Generated Policy:\n${responseContent}`);

  console.log("\n✅ Format Verification:");

  const numbers = [1, 2, 3, 4, 5];
  const hasNumberedSections = numbers.some((num) =>
    responseContent.includes(`${num}.`),
  );

  const keywords = ["eligibility", "conditions", "process", "timeline"];
  const lowerResponse = responseContent.toLowerCase();
  const hasConsistentStructure = keywords.every((keyword) =>
    lowerResponse.includes(keyword),
  );

  if (hasNumberedSections && hasConsistentStructure) {
    console.log("   ✓ Follows the exact format of our example!");
    console.log("   ✓ Numbered sections maintained");
    console.log("   ✓ Consistent structure achieved");
  } else {
    console.log("   ⚠️ Format needs adjustment - check your example!");
  }

  console.log("\n💡 One-Shot Benefits:");
  console.log("   ✓ Ensures format consistency");
  console.log("   ✓ Teaches style through example");
  console.log("   ✓ Perfect for policy documents");
  console.log("   ✓ Maintains company standards");

  // Create marker for completion
  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(path.join(markerDir, "task2_complete.txt"), "COMPLETED");
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n✅ Task 2 completed! One-shot prompting mastered!");
}

main().catch(console.error);
