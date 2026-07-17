import fs from "node:fs";
import path from "node:path";
import { ChatOllama } from "@langchain/ollama";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

async function main() {
  console.log("🤖 Task 3: LLM Integration");
  console.log("=".repeat(50));

  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  // TODO 2 & 3: Set temperature (0.3) and max tokens (500)
  const temperature = 0.3;
  const maxTokens = 500;

  const client = new ChatOllama({
    model: "gemma4:cloud",
    baseUrl: baseUrl,
    temperature: temperature,
    numPredict: maxTokens,
  });

  console.log("✅ Ollama client initialized");
  console.log(`   Using Endpoint: ${baseUrl}`);

  async function testGeneration() {
    console.log(`\n📝 Testing gemma4:cloud with temperature=${temperature}`);

    // Create messages for the query using LangChain core message classes
    const messages = [
      new SystemMessage("You are a helpful AI assistant."),
      new HumanMessage("What is RAG in AI? Answer in one sentence."),
    ];

    const response = await client.invoke(messages);
    const answer = response.content;

    console.log(`\n🤖 Test Response: ${answer}`);
    return true;
  }

  try {
    await testGeneration();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 LLM Integration Successful!");
    console.log("   - Model: gemma4:cloud");
    console.log("   - Temperature: 0.3 (focused)");
    console.log("   - Max tokens: 500 (concise)");
    console.log("   - LangChain integration ready for RAG!");
    console.log("=".repeat(50));

    const markerDir = "/root/markers";
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task3_llm_complete.txt"),
      "TASK3_COMPLETE:LLM_READY",
    );
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.log(
      "\n💡 Make sure Ollama is running and your API keys/endpoints are correctly configured!",
    );
  }

  console.log("\n💡 LLM ready to generate answers from retrieved context!");
  console.log("\n✅ Task 3 completed!");
}

main();
