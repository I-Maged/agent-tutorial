import fs from "node:fs";
import path from "node:path";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";

async function main() {
  console.log("🎯 Task 3: Dynamic Prompt Templates");
  console.log("=".repeat(50));

  console.log("\n📝 Creating a Reusable Template");
  console.log("=".repeat(50));

  // TODO 1: Create a versatile template
  const template = PromptTemplate.fromTemplate("Explain {topic} in {style}");

  // Test with actual LLM to show it works
  console.log("\n🤖 Testing Template with AI");
  console.log("=".repeat(50));

  // Initialize Local Ollama LLM with gemma:4b
  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434", // Defaults to local Ollama port
    model: "gemma4:cloud",
    temperature: 0.7,
  });

  // TODO 2: Use the template with LLM
  if (template && llm) {
    // Format the template with specific values
    const testPrompt = await template.format({
      topic: "artificial intelligence",
      style: "exactly 5 words",
    });

    console.log(`📝 Sending to AI: ${testPrompt}`);

    // Get AI response
    const response = await llm.invoke(testPrompt);
    console.log(`\n🤖 AI Response: ${response.content}`);
  }

  // Show the benefits
  console.log("\n💡 Template Benefits:");
  console.log("   ✓ ONE template, INFINITE uses");
  console.log("   ✓ Variables make it dynamic");
  console.log("   ✓ Consistent structure across all prompts");
  console.log("   ✓ Change inputs, not code!");

  // Create marker for completion
  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(path.join(markerDir, "task3_complete.txt"), "COMPLETED");
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n✅ Task 3 completed! One template, endless possibilities!");
}

main().catch(console.error);
