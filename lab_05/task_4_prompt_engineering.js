import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import fs from "node:fs";
import path from "node:path";

async function main() {
  console.log("📝 Task 4: Prompt Engineering");
  console.log("=".repeat(50));

  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const temperature = 0.3;
  const maxTokens = 200;

  const client = new ChatOllama({
    model: "gemma4:cloud",
    baseUrl: baseUrl,
    temperature: temperature,
    numPredict: maxTokens,
  });

  console.log("✅ Ollama client ready");

  function createRagPrompt(contextChunks, userQuestion) {
    const systemPrompt = `
        You are TechCorp's helpful AI assistant.
        Answer ONLY based on the provided context.
        If the answer is not in the context, say: 'I don't have that information in the provided documents.'
        Be concise and accurate.
    `;

    let contextText = "Context from TechCorp documents:\n\n";
    contextChunks.forEach((chunk, i) => {
      contextText += `[Document ${i + 1}]\n${chunk}\n\n`;
    });

    const userPrompt = `
        ${contextText}

        Question: ${userQuestion}

        Answer:
    `;

    return { systemPrompt, userPrompt };
  }

  async function testPromptEngineering() {
    const testChunks = [
      "TechCorp allows employees to work remotely up to 3 days per week. Core hours are 10 AM to 3 PM.",
      "Remote work arrangements must be approved by your manager and documented with HR.",
      "VPN is mandatory when accessing company resources from home.",
    ];

    const testQuestion = "How many days can I work from home?";

    const { systemPrompt, userPrompt } = createRagPrompt(
      testChunks,
      testQuestion,
    );

    console.log("📋 System Prompt:");
    console.log("-".repeat(40));
    console.log(systemPrompt);

    console.log("\n📋 User Prompt (with context):");
    console.log("-".repeat(40));
    console.log(
      userPrompt.length > 500 ? userPrompt.slice(0, 500) + "..." : userPrompt,
    );

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    const response = await client.invoke(messages);
    const answer = response.content;

    console.log("\n🤖 Generated Answer:");
    console.log("-".repeat(40));
    console.log(answer);

    return true;
  }

  try {
    await testPromptEngineering();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Prompt Engineering Complete!");
    console.log("   - System prompt: Context-aware");
    console.log("   - User prompt: Structured with context");
    console.log("   - Answer: Based on provided documents");
    console.log("   - Ready for complete RAG pipeline!");
    console.log("=".repeat(50));

    const markerDir = "/root/markers";
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task4_prompt_complete.txt"),
      "TASK4_COMPLETE:PROMPT_READY",
    );
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }

  console.log(
    "\n💡 The RAG prompt formula ensures accurate, context-based answers!",
  );
  console.log("\n✅ Task 4 completed!");
}

main();
