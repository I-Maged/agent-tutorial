import { ChatOllama } from "@langchain/ollama";

async function main() {
  console.log("🎯 Task 1: Zero-Shot Prompting");
  console.log("=".repeat(50));

  console.log("\n📝 Part 1: The Problem with Vague Prompts");
  console.log("-".repeat(40));

  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "gemma4:cloud",
    temperature: 0.7,
  });

  const vague_prompt = "write a data privacy policy";

  console.log(`Vague prompt: ${vague_prompt}`);

  const vague_response = await llm.invoke(vague_prompt);

  console.log(
    `\nVague response preview: ${vague_response.content.slice(0, 100)}...`,
  );
  console.log("Problem: Too generic, not useful for our company!");
  console.log("\n📝 Part 2: Specific Zero-Shot Prompting");
  console.log("-".repeat(40));

  const specific_prompt =
    "Write a 200-word data privacy policy for European customers covering GDPR requirements, data retention periods of 30 days, and user rights to deletion and portability";

  console.log(`✅ Specific prompt: ${specific_prompt.slice(0, 50)}...`);

  const specific_response = await llm.invoke(specific_prompt);
  console.log(
    `\nSpecific response preview: ${specific_response.content.slice(0, 200)}...`,
  );
  console.log("Success: Clear, actionable, company-specific!");

  console.log("\n📊 Comparison Results:");

  console.log(
    `Vague response length: ${vague_response.content.length} characters`,
  );
  console.log(
    `Specific response length: ${specific_response.content.length} characters`,
  );
  console.log(
    `Improvement: ${(specific_response.content.length / vague_response.content.length - 1) * 100}% more focused!`,
  );

  console.log("\n💡 Zero-Shot Best Practices:");
  console.log("  ✓ Be specific about the task");
  console.log("  ✓ Include constraints (word count, format)");
  console.log("  ✓ Define the context (European, GDPR)");
  console.log("  ✓ Specify requirements (retention, rights)");

  console.log("\n✅ Task 1 completed! Zero-shot prompting mastered!");
}

main();
