/*
 docker run -p 8000:8000 -v ./chroma_db:/chroma/chroma ghcr.io/chroma-core/chroma:latest
 */
import fs from "node:fs";
import path from "node:path";
import { ChromaClient } from "chromadb";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

async function main() {
  console.log("🗄️ Task 3: Building Vector Store natively with ChromaClient");
  console.log("=" * 55);

  // 1. Initialize native ChromaClient (using separate host & port to avoid URL formatting errors)
  const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
  });

  // 2. Initialize Ollama Embeddings using your local mxbai-embed-large model
  const ollamaEmbeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large",
    baseUrl: "http://localhost:11434",
  });

  console.log("✅ Native ChromaClient and Ollama Embeddings configured!");

  // Sample TechDocs documents
  const documentsText = [
    `Remote Work Policy: Employees can work from home up to 3 days per week.
     VPN access required. Core hours 10 AM - 3 PM local time. Manager approval needed.`,

    `Office Benefits: Free lunch on Tuesdays and Thursdays. Gym membership reimbursement
     up to $50/month. Annual learning budget of $2000 for courses and conferences.`,

    `Vacation Policy: 15 days PTO for first year, 20 days after 2 years.
     Sick leave separate - 10 days per year. Holidays follow local calendar.`,

    `Security Guidelines: Two-factor authentication required for all accounts.
     Password changes every 90 days. No sharing of credentials. Report incidents immediately.`,

    `Dress Code: Business casual Monday-Thursday. Casual Fridays allow jeans.
     Client meetings require business formal. Work from home has no dress requirements.`,
  ];

  // Convert to Document objects with mock nested metadata (to test cleaning)
  const documents = documentsText.map((text, i) => {
    return new Document({
      pageContent: text,
      metadata: {
        source: `handbook_section_${i + 1}`,
        type: "policy",
        id: i,
        // Mock nested metadata object that usually crashes ChromaDB
        loc: { lines: { from: i * 5, to: (i + 1) * 5 } },
      },
    });
  });

  console.log(`📚 Processing ${documents.length} documents...`);

  // 3. Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 50,
  });

  const splits = await textSplitter.splitDocuments(documents);
  console.log(`✂️ Created ${splits.length} chunks`);

  // 4. Reset or get the collection in ChromaDB
  const collectionName = "techdocs";
  try {
    await chroma.deleteCollection({ name: collectionName }).catch(() => {});
  } catch (err) {
    // Quietly catch if collection didn't exist
  }

  // Use embeddingFunction: null to bypass the peer dependency check
  const collection = await chroma.createCollection({
    name: collectionName,
    embeddingFunction: null,
  });

  console.log("\n🔨 Building database vectors and cleaning metadata...");

  const ids = splits.map((_, i) => `doc_chunk_${i}`);
  const contents = splits.map((split) => split.pageContent);

  // 5. Clean and Flatten Metadata to keep ChromaDB happy
  const cleanedMetadatas = splits.map((split) => {
    const metadata = { ...split.metadata };

    if (metadata.loc) {
      if (metadata.loc.lines) {
        metadata.loc_lines_from = metadata.loc.lines.from;
        metadata.loc_lines_to = metadata.loc.lines.to;
      }
      delete metadata.loc; // Remove the nested object entirely
    }
    return metadata;
  });

  // 6. Generate embeddings using our local Ollama model
  const embeddings = await ollamaEmbeddings.embedDocuments(contents);

  // 7. Add everything to ChromaDB
  await collection.add({
    ids: ids,
    embeddings: embeddings,
    metadatas: cleanedMetadatas,
    documents: contents,
  });

  console.log(
    `✅ Collection "${collectionName}" successfully populated with ${ids.length} vectors.`,
  );

  // 8. Test search using the vector DB
  console.log("\n🔍 Testing Vector Store (Semantic Search):");
  console.log("-".repeat(40));

  const testQueries = [
    "Can I work from home?",
    "What's the dress code for Friday?",
    "How many vacation days do I get?",
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Query: '${query}'`);

    // Generate embed query vector using Ollama
    const queryEmbedding = await ollamaEmbeddings.embedQuery(query);

    // Query ChromaDB directly with the generated vector
    const searchResult = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 1,
    });

    if (searchResult && searchResult.documents[0]?.length > 0) {
      const bestDocText = searchResult.documents[0][0];
      const bestMetadata = searchResult.metadatas[0][0];

      console.log(
        `✨ Best match: ${bestDocText.slice(0, 100).replace(/\s+/g, " ")}...`,
      );
      console.log(`   Source: ${bestMetadata.source || "unknown"}`);
    } else {
      console.log("⚠️ No matches found.");
    }
  }

  // Create completion marker
  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task3_vectorstore_complete.txt"),
      "COMPLETED",
    );
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n✅ Task 3 completed! Native vector store built successfully.");
}

main().catch(console.error);
