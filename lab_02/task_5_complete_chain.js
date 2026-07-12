import fs from "node:fs";
import path from "node:path";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  CommaSeparatedListOutputParser,
} from "@langchain/core/output_parsers";

async function main() {
  console.log("🎯 Task 5: Chain Composition with .pipe()");
  console.log("=".repeat(50));

  // Initialize Local Ollama LLM with gemma4:cloud
  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "gemma4:cloud",
    temperature: 0.3,
  });

  // Chain 1: Simple Analysis Chain
  console.log("\n⛓️ Chain 1: Simple Analysis");
  console.log("=".repeat(50));

  const analysisPrompt = PromptTemplate.fromTemplate(
    "Analyze {technology} and provide pros and cons in 2-3 sentences",
  );

  const strParser = new StringOutputParser();

  // TODO 1: Build analysis chain using the .pipe() method
  const analysisChain = analysisPrompt.pipe(llm).pipe(strParser);

  if (analysisChain) {
    const result = await analysisChain.invoke({
      technology: "blockchain",
    });
    console.log("📝 Input: 'Analyze blockchain'");
    console.log(`✅ Output: ${result}`);
  }

  // Chain 2: List Generation Chain
  console.log("\n⛓️ Chain 2: List Generation with Parser");
  console.log("=".repeat(50));

  const listPrompt = PromptTemplate.fromTemplate(
    "List 3 use cases for {technology} (comma-separated):",
  );

  const listParser = new CommaSeparatedListOutputParser();

  // TODO 2: Build list chain with a different parser
  const listChain = listPrompt.pipe(llm).pipe(listParser);

  if (listChain) {
    const result = await listChain.invoke({
      technology: "blockchain",
    });
    console.log("📝 Input: 'List use cases for blockchain'");
    console.log(`✅ Output: ${JSON.stringify(result)}`);
    console.log(
      `✅ Type: ${Array.isArray(result) ? "Array" : typeof result} - JavaScript array!`,
    );
  }

  // Demonstrate the power of chains
  console.log("\n🎉 Complete Pipeline Example");
  console.log("=".repeat(50));

  const testTech = "artificial intelligence";
  console.log(`Technology: ${testTech}\n`);

  if (analysisChain && listChain) {
    // Chain 1: Get analysis
    const analysis = await analysisChain.invoke({ technology: testTech });
    console.log(`1️⃣ Analysis:\n   ${analysis}`);

    // Chain 2: Get use cases
    const useCases = await listChain.invoke({ technology: testTech });
    console.log("\n2️⃣ Use Cases:");
    useCases.forEach((useCase, i) => {
      console.log(`   ${i + 1}. ${useCase.trim()}`);
    });
  }

  // Show the magic
  console.log("\n💡 Chain Composition Magic:");
  console.log("   ✓ The .pipe() method connects everything");
  console.log("   ✓ prompt.pipe(llm).pipe(parser) = complete pipeline");
  console.log("   ✓ Different parsers = different output formats");
  console.log("   ✓ Same LLM, infinite possibilities!");

  // Create marker for completion
  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(path.join(markerDir, "task5_complete.txt"), "COMPLETED");
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n✅ Task 5 completed! You've mastered LangChain chains!");
  console.log("🏆 You can now build any AI pipeline with the .pipe() method!");
}

main().catch(console.error);
