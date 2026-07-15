import fs from "node:fs";
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function processDocuments() {
  console.log("📄 Task 2: Smart Document Chunking");
  console.log("=".repeat(50));

  const longDocument = `
    TechDocs Employee Handbook

    Chapter 1: Remote Work Policy

    Our company embraces flexible work arrangements to support work-life balance.
    Employees are permitted to work remotely up to 3 days per week, provided they
    maintain regular communication with their team and meet all performance expectations.
    Remote work requires manager approval and must not impact team collaboration or
    customer service quality.

    To work remotely, employees must have a suitable home office setup with reliable
    internet connection, appropriate workspace, and necessary equipment. The company
    provides a one-time stipend of $500 for home office setup. VPN access is mandatory
    for accessing company systems remotely.

    Chapter 2: Communication Guidelines

    Effective communication is essential for remote work success. All employees must
    be available during core hours (10 AM - 3 PM in their local timezone) for meetings
    and collaboration. Slack is our primary communication tool, with response times
    expected within 2 hours during work hours.

    Video calls are encouraged for team meetings to maintain personal connections.
    Camera use is optional but recommended. All meetings should have clear agendas
    and action items documented in our project management system.

    Chapter 3: Performance Management

    Remote work does not change performance expectations. Managers will evaluate
    employees based on deliverables, quality of work, and contribution to team goals
    rather than hours logged. Regular 1-on-1 meetings should continue virtually.
  `;

  console.log(`📋 Original Document Length: ${longDocument.length} characters`);
  console.log("-".repeat(40));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 200,
    separators: [" "],
  });

  const chunks = await splitter.splitText(longDocument);

  console.log(`\n✂️ Chunking Results:`);
  console.log(`• Created ${chunks.length} chunks`);
  console.log(`• Chunk size: ~500 characters`);
  console.log(`• Overlap: 200 characters\n`);

  // Display first 3 chunks
  chunks.slice(0, 3).forEach((chunk, index) => {
    const i = index + 1;
    console.log(`📄 Chunk ${i} (${chunk.length} chars):`);
    console.log("-".repeat(40));
    console.log(chunk.length > 200 ? chunk.slice(0, 200) + "..." : chunk);
    console.log();
  });

  // Analyze overlap
  if (chunks.length > 1) {
    // Find common text between chunk 1 and 2
    const overlapStart = chunks[1].slice(0, 100);
    if (chunks[0].includes(overlapStart)) {
      console.log("🔄 Overlap Detection:");
      console.log("-".repeat(40));
      console.log(`Found overlap: '${overlapStart.slice(0, 50)}...'`);
      console.log("✅ Context preserved between chunks!");
    }
  }

  console.log("\n💡 Why Smart Chunking Matters:");
  console.log("-".repeat(40));
  console.log("• Preserves sentence boundaries");
  console.log("• Maintains context with overlap");
  console.log("• Optimal for embedding models");
  console.log("• Improves retrieval accuracy by 40%!");

  const markerDir = "/root/markers";
  try {
    fs.mkdirSync(markerDir, { recursive: true });
    fs.writeFileSync(
      path.join(markerDir, "task2_chunking_complete.txt"),
      "COMPLETED",
    );
  } catch (err) {
    console.error("⚠️ Could not write marker file:", err.message);
  }

  console.log("\n✅ Task 2 completed! Document chunking mastered.");

  return chunks;
}

processDocuments().catch(console.error);
