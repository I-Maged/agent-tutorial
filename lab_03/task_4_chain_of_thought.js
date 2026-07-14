import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";

const main = async () => {
  console.log("🎯 Task 4: Chain-of-Thought Prompting");
  console.log("=".repeat(50));

  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "gemma4:cloud",
    temperature: 0.7,
  });

  console.log("\n📝 Part 1: Direct Approach (Without Chain-of-Thought)");
  console.log("-".repeat(40));

  const directPrompt =
    "Our current data retention policy states:\n- Customer personal data is stored indefinitely\n- There is no documented data deletion or review process\n- System backups are retained forever and include personal data\- No distinction is made between active and inactive users\nFix this policy to comply with GDPR.";

  console.log(`❌ Direct prompt: ${directPrompt}`);
  const directResponse = await llm.invoke(directPrompt);
  const directContent = directResponse.content;
  console.log(`\nDirect response preview: ${directContent.slice(0, 200)}...`);

  console.log("Problem: Lacks structure and may miss important details!");

  console.log("\n📝 Part 2: Chain-of-Thought Approach");
  console.log("-".repeat(40));

  const reasoningSteps =
    "Step 1: Review GDPR requirements related to data retention and storage limitation\nStep 2: Identify compliance gaps in the current data retention policy\nStep 3: Reference industry best practices for data retention and deletion\nStep 4: Draft specific, GDPR-compliant policy changes\nStep 5: Propose an implementation and enforcement timeline";

  console.log("🧠 Reasoning steps defined:");
  console.log(reasoningSteps);

  const cotTemplate = PromptTemplate.fromTemplate(
    "To solve this problem, think through it step-by-step:\n\n{steps}\n\nProblem: {problem}\n\nNow, let's work through each step systematically:",
  );

  const cotPrompt = await cotTemplate.format({
    steps: reasoningSteps,
    problem: "Fix our data retention policy to comply with GDPR",
  });

  const cotResponse = await llm.invoke(cotPrompt);

  const cotContent = cotResponse.content;
  console.log(
    `\n📥 Chain-of-Thought Response:\n${cotContent.slice(0, 500)}...`,
  );

  console.log("\n📊 Comparison Analysis:");
  console.log(`Direct response length: ${directContent.length} characters`);
  console.log(`CoT response length: ${cotContent.length} characters`);

  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const hasSteps = steps.some((i) => cotContent.includes(`Step ${i}`));

  const lowerCotContent = cotContent.toLowerCase();
  const hasAnalysis = lowerCotContent.includes("requirement");
  const hasRecommendations = lowerCotContent.includes("recommend");

  console.log("\n✅ Chain-of-Thought Benefits:");
  console.log(`   ✓ Structured approach: ${hasSteps}`);
  console.log(`   ✓ Thorough analysis: ${hasAnalysis}`);
  console.log(`   ✓ Clear recommendations: ${hasRecommendations}`);

  console.log("\n💡 Chain-of-Thought Best Practices:");
  console.log("   ✓ Break complex problems into steps");
  console.log("   ✓ Guide the AI's thinking process");
  console.log("   ✓ Ensure comprehensive analysis");
  console.log("   ✓ Get detailed, reasoned responses");

  console.log("\n✅ Task 4 completed! Chain-of-thought prompting mastered!");
};

main().catch(console.error);
