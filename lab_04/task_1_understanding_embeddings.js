import fs from "node:fs";
import path from "node:path";
import { pipeline } from "@xenova/transformers";

// Helper function to calculate Cosine Similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  console.log(
    "🧠 Task 1: Embeddings - Teaching Computers to Understand Meaning\n",
  );

  // TODO 1: Initialize model that converts text -> meaningful numbers
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    {
      local_files_only: false,
    },
  );

  // Scenario: User searching documentation
  const query = "forgot my password";

  const docs = [
    "Password recovery: Use the 'Reset Password' link on login page",
    "Vacation policy: Request time off 2 weeks in advance",
    "Account security: Enable two-factor authentication",
    "Login help: Contact IT if you cannot access your account",
  ];

  // TODO 2: Convert query and docs to embeddings
  const queryOutput = await extractor(query, {
    pooling: "mean",
    normalize: true,
  });
  const queryEmb = Array.from(queryOutput.data);

  const docEmbs = [];
  for (const doc of docs) {
    const docOutput = await extractor(doc, {
      pooling: "mean",
      normalize: true,
    });
    docEmbs.push(Array.from(docOutput.data));
  }

  // TODO 3: Find semantic matches (Calculate cosine similarity for each document)
  const scores = docEmbs.map((docEmb) => cosineSimilarity(queryEmb, docEmb));

  console.log(`Query: '${query}'\n`);
  console.log("Results (score > 0.3 = relevant):");

  docs.forEach((doc, i) => {
    const score = scores[i];
    const marker = score > 0.3 ? "✅" : "  ";
    console.log(`${marker} [${score.toFixed(2)}] ${doc}`);
  });

  console.log("\n💡 Notice: Found 'Password recovery' and 'Login help'");
  console.log("   Even though query didn't contain those exact words!");

  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task1_embeddings_complete.txt"),
      "DONE",
    );
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }
}

main().catch(console.error);
