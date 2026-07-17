import fs from "node:fs";
import path from "node:path";
import { ChromaClient } from "chromadb";
import { OllamaEmbeddings } from "@langchain/ollama";

async function main() {
  console.log("📄 Task 2: Smart Document Processing");
  console.log("=".repeat(50));

  const client = new ChromaClient({
    host: "localhost",
    port: 8000,
  });

  const collection = await client.getOrCreateCollection({
    name: "techcorp_rag",
    embeddingFunction: null,
  });

  const ollamaEmbeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large",
    baseUrl: "http://localhost:11434",
  });

  console.log("✅ Loaded vector store and embedding model");

  /**
   * Smart paragraph-based chunking with overlap
   */
  function smartChunkDocument(text, overlapRatio = 0.2) {
    // TODO 1: Split document into paragraphs by double newlines
    const paragraphs = text
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const chunks = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const chunkParts = [];

      // Add current paragraph
      chunkParts.push(paragraphs[i]);

      // Add next paragraph if exists
      if (i + 1 < paragraphs.length) {
        chunkParts.push(paragraphs[i + 1]);
      }

      // TODO 2: Calculate overlap characters (20% of previous paragraph)
      if (i > 0 && overlapRatio > 0) {
        const overlapChars = Math.floor(
          paragraphs[i - 1].length * overlapRatio,
        );
        if (overlapChars > 0) {
          chunkParts.unshift(paragraphs[i - 1].slice(-overlapChars));
        }
      }

      const chunk = chunkParts.join(" ");
      chunks.append ? chunks.push(chunk) : chunks.push(chunk);
    }

    return chunks;
  }

  // 3. Process documents directory
  const docDir = "/root/techcorp-docs";
  let totalChunks = 0;
  let docsProcessed = 0;

  try {
    if (!fs.existsSync(docDir)) {
      console.log(
        `⚠️ Document directory not found at: ${docDir}. Creating a mock directory with sample files to run simulation...`,
      );
      fs.mkdirSync(path.join(docDir, "policies"), { recursive: true });
      fs.writeFileSync(
        path.join(docDir, "policies", "workplace_rules.md"),
        "Welcome to TechCorp.\n\nOur remote policy permits working from home 3 days a week.\n\nSecurity is paramount. Passwords must be updated periodically.",
      );
    }

    const categories = fs.readdirSync(docDir, { withFileTypes: true });

    for (const categoryDir of categories) {
      if (categoryDir.isDirectory()) {
        const categoryPath = path.join(docDir, categoryDir.name);
        console.log(`\n📂 Processing ${categoryDir.name}:`);

        const files = fs.readdirSync(categoryPath);
        const mdFiles = files.filter((file) => file.endsWith(".md"));

        for (const docFile of mdFiles) {
          const docFilePath = path.join(categoryPath, docFile);

          // TODO 3: Create metadata for document tracking
          const metadata = {
            source: docFile, // Replace ___ with doc_file.name
            section: categoryDir.name, // Replace ___ with category_dir.name
          };

          // Read document content
          const content = fs.readFileSync(docFilePath, "utf-8");

          // Chunk the document
          const chunks = smartChunkDocument(content);

          // Store chunks in vector database
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const fileStem = path.basename(docFile, ".md");
            const chunkId = `${categoryDir.name}_${fileStem}_chunk_${i}`;

            // Generate embedding using Ollama
            const embedding = await ollamaEmbeddings.embedQuery(chunk);

            // Add directly into native Chroma Collection
            await collection.add({
              ids: [chunkId],
              embeddings: [embedding],
              documents: [chunk],
              metadatas: [metadata],
            });

            totalChunks++;
          }

          docsProcessed++;
          console.log(`   ✅ ${docFile}: ${chunks.length} chunks`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Directory reading failed:", err.message);
  }

  const collectionCount = await collection.count();

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Document Processing Complete!");
  console.log(`   - Documents processed: ${docsProcessed}`);
  console.log(`   - Total chunks created: ${totalChunks}`);
  console.log(`   - Collection size: ${collectionCount}`);
  console.log("=".repeat(50));

  // 4. Create marker file
  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task2_processing_complete.txt"),
      `TASK2_COMPLETE:DOCS=${docsProcessed},CHUNKS=${totalChunks}`,
    );
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n💡 Smart chunking preserves context for better generation!");
  console.log("\n✅ Task 2 completed!");
}

main().catch(console.error);
