import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";

async function main() {
  console.log("🎯 Task 5: Prompting Technique Comparison");
  console.log("=" * 50);

  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "gemma4:cloud",
    temperature: 0.7,
  });

  const testProblem = "Create an employee remote work policy";

  console.log(`🎯 Test Problem: ${testProblem}`);
  console.log("Testing all 4 prompting techniques...\n");

  const results = {};

  //  1. ZERO-SHOT PROMPTING
  console.log("1️⃣ Zero-Shot Prompting");
  console.log("-".repeat(40));

  const zeroShotResult = await llm.invoke(testProblem);

  results["zero_shot"] = zeroShotResult.content;
  console.log(`Response length: ${zeroShotResult.content.length} characters`);
  console.log(`Preview: ${zeroShotResult.content.slice(0, 100)}...\n`);

  //   # 2. ONE-SHOT PROMPTING
  console.log("2️⃣ One-Shot Prompting");
  console.log("-".repeat(40));

  const oneShotTemplate = PromptTemplate.fromTemplate(
    "Example Policy:\nVACATION POLICY\n1. Eligibility: All full-time employees\n2. Accrual: 15 days per year\n3. Request: Submit 2 weeks in advance\n4. Approval: Manager discretion\n\nNow create: {policy_type}",
  );

  const oneShotPrompt = await oneShotTemplate.format({
    policy_type: testProblem,
  });

  const oneShotResult = await llm.invoke(oneShotPrompt);
  results["one_shot"] = oneShotResult.content;

  console.log(`Response length: ${oneShotResult.content.length} characters`);
  console.log(`Preview: ${oneShotResult.content.slice(0, 100)}...\n`);

  // 3. FEW-SHOT PROMPTING
  console.log("3️⃣ Few-Shot Prompting");
  console.log("-".repeat(40));

  const examples = [
    {
      policy: "sick leave",
      format:
        "1. Coverage: 10 days/year\n2. Documentation: Doctor's note after 3 days",
    },
    {
      policy: "training",
      format:
        "1. Budget: $2000/employee/year\n2. Approval: Required for external courses",
    },
  ];

  const examplePrompt = PromptTemplate.fromTemplate(
    "Policy: {policy}\nFormat:\n{format}",
  );

  const fewShotPrompt = new FewShotPromptTemplate({
    examples: examples,
    examplePrompt: examplePrompt,
    prefix: "Examples of our policy format:",
    suffix: "Now create: {policy_type}",
    inputVariables: ["policy_type"],
  });

  const formattedPrompt = await fewShotPrompt.format({
    policy_type: testProblem,
  });

  const fewShotResult = await llm.invoke(formattedPrompt);
  results["few_shot"] = fewShotResult.content;

  console.log(`Response length: ${fewShotResult.content.length} characters`);
  console.log(`Preview: ${fewShotResult.content.slice(0, 100)}...\n`);

  //  4. CHAIN-OF-THOUGHT PROMPTING
  console.log("4️⃣ Chain-of-Thought Prompting");
  console.log("-".repeat(40));

  const cotTemplate = PromptTemplate.fromTemplate(
    `Think through this step-by-step:\n
    1. Consider who needs remote work\n
    2. Define eligibility criteria\n
    3. Set communication requirements\n
    4. Establish work hours and availability\n
    5. Specify equipment and security needs\n\nProblem: {problem}\n\nWork through each step to create the policy:`,
  );

  const cotPrompt = await cotTemplate.format({
    problem: testProblem,
  });

  const cotResult = await llm.invoke(cotPrompt);
  results["chain_of_thought"] = cotResult.content;

  console.log(`Response length: ${cotResult.content.length} characters`);
  console.log(`Preview: ${cotResult.content.slice(0, 100)}...\n`);

  // COMPARISON ANALYSIS
  console.log("📊 Technique Comparison Results");
  console.log("=".repeat(50));

  for (const [technique, response] of Object.entries(results)) {
    const lowerResponse = response.toLowerCase();
    const hasStructure =
      lowerResponse.includes("numbered") || response.includes("1.");
    const isSpecific =
      lowerResponse.includes("employee") && lowerResponse.includes("remote");

    console.log(`\n${technique.toUpperCase()}:`);
    console.log(`   Length: ${response.length} characters`);
    console.log(`   Has structure: ${hasStructure}`);
    console.log(`   Specificity: ${isSpecific}`);
  }

  const mostDetailed = Object.keys(results).reduce((maxKey, currentKey) =>
    results[currentKey].length > results[maxKey].length ? currentKey : maxKey,
  );

  console.log(
    `\n🏆 Most Detailed: ${mostDetailed} (${results[mostDetailed].length} characters)`,
  );

  console.log("\n💡 When to Use Each Technique:");
  console.log("   ✓ Zero-Shot: Quick, general responses");
  console.log("   ✓ One-Shot: When you need specific formatting");
  console.log("   ✓ Few-Shot: For consistent style across multiple outputs");
  console.log("   ✓ Chain-of-Thought: For complex, multi-step problems");

  console.log("\n✅ Task 5 completed!");
}

main().catch(console.error);
