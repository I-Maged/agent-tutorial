import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate, FewShotPromptTemplate } from "@langchain/core/prompts";

const main = async () => {
  console.log("🎯 Task 3: Few-Shot Prompting");
  console.log("=".repeat(50));

  const llm = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "gemma4:cloud",
    temperature: 0.7,
  });

  console.log("\n📝 Creating Few-Shot Examples");
  console.log("-".repeat(40));

  const examples = [
    {
      input: "refund request",
      output:
        "I understand you'd like a refund. Let me check your order details. Our refund policy allows returns within 30 days. I'll process this for you right away.",
    },
    {
      input: "shipping delay",
      output:
        "I apologize for the shipping delay. Let me track your package immediately. I see it's currently in transit and should arrive within 2 days. I'll apply a shipping credit to your account.",
    },
    {
      input: "password reset",
      output:
        "I'll help you reset your password. For security, I've sent a reset link to your registered email. The link expires in 1 hour. Please check your spam folder if you don't see it.",
    },
  ];

  console.log("📚 Examples loaded:");

  //   for (let i = 0; i < examples.length; i++) {
  //     const ex = examples[i];
  //     console.log(`Example ${i + 1}: ${ex.input} → ${ex.output.slice(0, 50)}...`);
  //   }

  examples.forEach((ex, i) => {
    console.log(
      `   Example ${i + 1}: ${ex.input} → ${ex.output.slice(0, 50)}...`,
    );
  });

  const examplePrompt = PromptTemplate.fromTemplate(
    "Customer Issue: {input}\nSupport Response: {output}",
  );

  const fewShotPrompt = new FewShotPromptTemplate({
    examples: examples,
    examplePrompt: examplePrompt,
    prefix:
      "You are a helpful customer support agent. Here are examples of how to respond:",
    suffix: "Customer Issue: {input}\nSupport Response:",
    inputVariables: ["input"],
    exampleSeparator: "\n\n",
  });

  console.log("\n🔄 Testing Few-Shot Prompting");
  console.log("-".repeat(40));

  const test_input = "account locked";

  const formatted_prompt = await fewShotPrompt.format({
    input: test_input,
  });

  console.log(`📤 New customer issue: ${test_input}`);
  console.log("Using few-shot learning from 3 examples...");

  const response = await llm.invoke(formatted_prompt);
  const responseText = response.content.toLowerCase();
  console.log(`\n📥 AI Response: ${response.content}`);

  console.log("\n📊 Response Analysis:");

  const empathyWords = ["understand", "apologize", "help"];
  const actionWords = ["check", "process", "send", "reset"];
  const timelineWords = ["immediately", "hour", "days", "now"];

  const hasEmpathy = empathyWords.some((word) => responseText.includes(word));
  const hasAction = actionWords.some((word) => responseText.includes(word));
  const hasTimeline = timelineWords.some((word) => responseText.includes(word));

  const qualityScore = [hasEmpathy, hasAction, hasTimeline].filter(
    Boolean,
  ).length;

  console.log(`   ✓ Shows empathy: ${hasEmpathy}`);
  console.log(`   ✓ Takes action: ${hasAction}`);
  console.log(`   ✓ Provides timeline: ${hasTimeline}`);
  console.log(`   Quality Score: ${qualityScore}/3`);

  console.log("\n💡 Few-Shot Advantages:");
  console.log("   ✓ Learns your specific tone and style");
  console.log("   ✓ Maintains consistency across responses");
  console.log("   ✓ Perfect for customer service");
  console.log("   ✓ Reduces training time");

  console.log("\n✅ Task 3 completed! Few-shot prompting mastered!");
};

main().catch(console.error);
