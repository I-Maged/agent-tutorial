import fs from "node:fs";
import path from "node:path";
import { ChromaClient } from "chromadb";
import { OllamaEmbeddings } from "@langchain/ollama";

async function buildSearchEngine() {
  console.log("🔍 Task 4: Semantic Search Implementation (Node.js)");
  console.log("=".repeat(55));

  // 1. Initialize native ChromaClient
  const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
  });

  // 2. Initialize Ollama Embeddings using your local model
  const ollamaEmbeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large",
    baseUrl: "http://localhost:11434",
  });

  // TechDocs complete knowledge base
  const knowledgeBase = [
    "Remote work policy allows employees to work from home up to 3 days per week with manager approval.",
    "Dress code is business casual Monday-Thursday. Jeans are permitted on Fridays only.",
    "Annual performance reviews happen in December with mid-year check-ins in June.",
    "Health insurance covers employee and dependents with company paying 80% of premiums.",
    "401k retirement plan includes company match up to 6% of salary.",
    "Vacation policy provides 15 days PTO first year, increasing to 20 days after 2 years.",
    "Sick leave is separate from vacation with 10 days allocated annually.",
    "Training budget of $2000 per employee for professional development courses.",
    "Office provides free lunch on Tuesdays and Thursdays for all employees.",
    "Parking is free for all employees in the company garage.",
    "Work hours are flexible but core hours 10 AM to 3 PM are required.",
    "Security policy requires password changes every 90 days and two-factor authentication.",
  ];

  console.log(
    `📚 Loading ${knowledgeBase.length} documents into vector store...`,
  );

  const collectionName = "search_engine_docs";

  // Re-create the collection to ensure a clean state
  try {
    await chroma.deleteCollection({ name: collectionName }).catch(() => {});
  } catch (_) {}

  const collection = await chroma.createCollection({
    name: collectionName,
    embeddingFunction: null, // Avoid default embedding peer package checking
  });

  // Prepare IDs, metadata objects, and compute vectors
  const ids = knowledgeBase.map((_, i) => `doc_${i}`);
  const metadatas = knowledgeBase.map((_, i) => ({ id: i }));
  const embeddings = await ollamaEmbeddings.embedDocuments(knowledgeBase);

  // Add items directly to Chroma
  await collection.add({
    ids: ids,
    embeddings: embeddings,
    metadatas: metadatas,
    documents: knowledgeBase,
  });

  console.log("✅ Vector store ready!\n");

  // Helper functions for similarity search mimicking the Python behavior
  async function similaritySearch(query, k) {
    const queryEmbedding = await ollamaEmbeddings.embedQuery(query);
    const response = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
    });

    const results = [];
    if (response.documents && response.documents[0]) {
      for (let i = 0; i < response.documents[0].length; i++) {
        results.push({
          pageContent: response.documents[0][i],
          metadata: response.metadatas[0][i],
        });
      }
    }
    return results;
  }

  async function similaritySearchWithScore(query, k) {
    const queryEmbedding = await ollamaEmbeddings.embedQuery(query);
    const response = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
    });

    const results = [];
    if (response.documents && response.documents[0]) {
      for (let i = 0; i < response.documents[0].length; i++) {
        results.push([
          {
            pageContent: response.documents[0][i],
            metadata: response.metadatas[0][i],
          },
          response.distances[0][i], // ChromaDB exposes L2 distance as the score metric
        ]);
      }
    }
    return results;
  }

  // TODO 1: Set search query
  const searchQuery = "work from home policy";

  // TODO 2: Set number of results
  const k = 3;

  console.log(`🔎 Searching for: '${searchQuery}'`);
  console.log(`   Returning top ${k} results`);
  console.log("-".repeat(40));

  // Basic similarity search
  const results = await similaritySearch(searchQuery, k);

  console.log("\n📊 Search Results:");
  results.forEach((doc, i) => {
    console.log(`\n${i + 1}. ${doc.pageContent}`);
  });

  // TODO 3: Similarity search with scores
  const scoreThreshold = 1.3;

  console.log(`\n🎯 Filtered Search (threshold < ${scoreThreshold}):`);
  console.log("-".repeat(40));

  const resultsWithScores = await similaritySearchWithScore(searchQuery, 5);

  const relevantResults = resultsWithScores.filter(
    ([_, score]) => score <= scoreThreshold,
  );

  if (relevantResults.length > 0) {
    relevantResults.slice(0, 3).forEach(([doc, score]) => {
      console.log(`\n📄 Score: ${score.toFixed(3)}`);
      console.log(`   ${doc.pageContent.slice(0, 100)}...`);
    });
  } else {
    console.log("No results above threshold");
  }

  // Advanced search demonstrations
  console.log("\n✨ Semantic Magic Examples:");
  console.log("-".repeat(40));

  const testSearches = [
    { query: "Can I bring my dog to work?", expectedTopic: "dress code" },
    { query: "How many days off do I get?", expectedTopic: "vacation" },
    { query: "retirement savings", expectedTopic: "401k" },
  ];

  for (const { query, expectedTopic } of testSearches) {
    const searchResults = await similaritySearch(query, 1);
    const firstMatchText = searchResults[0].pageContent.toLowerCase();
    const foundTopic = firstMatchText.includes(expectedTopic.toLowerCase());
    const status = foundTopic ? "✅" : "❌";
    console.log(`${status} '${query}' → Found: ${expectedTopic}`);
  }

  console.log("\n🏆 What You've Achieved:");
  console.log("-".repeat(40));
  console.log("• Built a semantic search engine");
  console.log("• Search understands MEANING not keywords");
  console.log("• 'work from home' finds 'remote work policy'");
  console.log("• Ready for production deployment!");

  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task4_search_complete.txt"),
      "COMPLETED",
    );
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n✅ Task 4 completed! Semantic search mastered!");
  console.log("🎉 You've completed the Vector Databases lab!");
}

buildSearchEngine().catch(console.error);
