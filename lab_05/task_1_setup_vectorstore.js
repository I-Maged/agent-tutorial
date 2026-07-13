/*
 docker run -p 8000:8000 -v ./chroma_db:/chroma/chroma ghcr.io/chroma-core/chroma:latest
 */
import fs from "node:fs";
import path from "node:path";
import { ChromaClient } from "chromadb";
import { pipeline } from "@xenova/transformers";

async function main() {
  console.log("🔧 Task 1: Setting up Vector Store for RAG");
  console.log("=".repeat(50));

  // Connect to your locally running Chroma Server
  const client = new ChromaClient({
    path: "http://localhost:8000", // Pointing to the running server instead of a local folder path
  });

  console.log("✅ ChromaDB client connected");

  // TODO 2: Create or get collection named "techcorp_rag"
  const collection = await client.getOrCreateCollection({
    name: "techcorp_rag",
  });

  console.log(`✅ Collection '${collection.name}' ready`);

  // TODO 3: Initialize embedding model for 384-dimension vectors
  // Using feature-extraction pipeline to generate raw embeddings
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
  );

  console.log("✅ Embedding model loaded");

  // Test the setup
  const testText = "Testing RAG setup";

  // Xenova output contains pooling info, we extract the structural raw array data
  const output = await extractor(testText, {
    pooling: "mean",
    normalize: true,
  });
  const testEmbedding = Array.from(output.data);

  console.log(`✅ Test embedding created: ${testEmbedding.length} dimensions`);

  // Verify everything works
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SUCCESS! Your vector store is ready for RAG!");
  console.log("   - ChromaDB initialized");
  console.log(`   - Collection: ${collection.name}`);
  console.log("   - Embedding model: all-MiniLM-L6-v2");
  console.log(`   - Vector dimensions: ${testEmbedding.length}`);
  console.log("=".repeat(50));

  // Create marker file
  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task1_setup_complete.txt"),
      "TASK1_COMPLETE",
    );
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log(
    "\n💡 Remember: You learned this in Vector Databases Lab - now applying it for RAG!",
  );
  console.log("\n✅ Task 1 completed!");
}

main().catch(console.error);
