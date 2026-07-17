import fs from "node:fs";
import path from "node:path";
import { ChromaClient } from "chromadb";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

async function main() {
  console.log("🚀 Task 5: Complete RAG Pipeline");
  console.log("=".repeat(50));

  const clientDb = new ChromaClient({
    host: "localhost",
    port: 8000,
  });

  const collection = await clientDb.getOrCreateCollection({
    name: "techcorp_rag",
    embeddingFunction: null,
  });

  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  const modelEmbeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large",
    baseUrl: baseUrl,
  });

  const clientLlm = new ChatOllama({
    model: "gemma4:cloud",
    baseUrl: baseUrl,
    temperature: 0.3,
    numPredict: 500,
  });

  console.log("✅ All components loaded");

  async function ragPipeline(userQuestion) {
    /** Complete RAG pipeline: Retrieve → Augment → Generate */

    console.log(`\n📝 Question: '${userQuestion}'`);
    console.log("-".repeat(50));

    // Step 1: RETRIEVE
    console.log("1️⃣ RETRIEVE: Converting to embedding...");
    const queryEmbedding = await modelEmbeddings.embedQuery(userQuestion);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    });

    const retrievedChunks = results.documents[0] || [];
    const metadatas = results.metadatas[0] || [];

    console.log(`   ✅ Retrieved ${retrievedChunks.length} relevant chunks`);
    metadatas.forEach((meta) => {
      console.log(`      - ${meta.source} (${meta.section})`);
    });

    // Step 2: AUGMENT
    console.log("\n2️⃣ AUGMENT: Building context...");

    const systemPrompt = `You are TechCorp's helpful AI assistant.
        Answer ONLY based on the provided context.
        If the answer is not in the context, say: 'I don't have that information in the provided documents.'
    `;

    let contextText = "Context from TechCorp documents:\n\n";
    retrievedChunks.forEach((chunk, i) => {
      contextText += `[Document ${i + 1}]\n${chunk}\n\n`;
    });

    const userPrompt = `${contextText}\nQuestion: ${userQuestion}\n\nAnswer:`;

    console.log("   ✅ Context prepared with retrieved documents");

    // Step 3: GENERATE
    console.log("\n3️⃣ GENERATE: Creating answer...");

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    const response = await clientLlm.invoke(messages);
    const answer = response.content;

    const sources = metadatas.map((meta) => meta.source);
    const uniqueSources = [...new Set(sources)];

    const finalResponse = `${answer}\n\n📎 Sources: ${uniqueSources.join(", ")}`;

    return finalResponse;
  }

  // Test the complete pipeline
  async function testRagPipeline() {
    const testQuestions = [
      "Can I bring my dog to the office?",
      "How many vacation days do I get?",
      "What is the remote work policy?",
    ];

    for (const question of testQuestions) {
      const answer = await ragPipeline(question);
      console.log("\n" + "=".repeat(50));
      console.log("💬 ANSWER:");
      console.log(answer);
      console.log("=".repeat(50));
    }
  }

  // Run the test
  try {
    const collectionCount = await collection.count();

    if (collectionCount === 0) {
      console.log("\n⚠️ No documents in database. Please run Task 2 first!");
    } else {
      console.log(`\n📚 Database has ${collectionCount} chunks ready`);
      await testRagPipeline();

      console.log("\n" + "=".repeat(50));
      console.log("🎉 RAG Pipeline Complete!");
      console.log("   - Retrieval: Semantic search working");
      console.log("   - Augmentation: Context injection ready");
      console.log("   - Generation: LLM producing answers");
      console.log("   - Citations: Sources included");
      console.log("=".repeat(50));

      // Create marker file
      const markerDir = "/root/markers";
      fs.mkdirSync(markerDir, { recursive: true });
      fs.writeFileSync(
        path.join(markerDir, "task5_rag_complete.txt"),
        "TASK5_COMPLETE:RAG_PIPELINE_READY",
      );
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }

  console.log(
    "\n🎯 You've built a complete RAG system - from search to answers!",
  );
  console.log("\n✅ Task 5 completed!");
}

main();
