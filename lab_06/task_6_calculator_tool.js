import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
// import { z } from "zod";
import * as z from "zod";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🧮 Task 6: Simple Calculator Tool\n");

const StateAnnotation = {
  query: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  is_math: {
    value: (x, y) => y ?? x,
    default: () => false,
  },
  result: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
};

// Define our calculator tool using the structured tool API with a Zod schema
const calculatorTool = tool(
  async ({ expression }) => {
    try {
      // Basic mathematical extraction and evaluation safety check
      // Replacing common text expressions with symbols if they slip in
      const cleanExpression = expression
        .replace(/plus/gi, "+")
        .replace(/minus/gi, "-")
        .replace(/times/gi, "*")
        .replace(/divided by/gi, "/");

      // Clean execution check (only numbers, basic operators, spaces, and math functions)
      if (/[^0-9\+\-\*\/\(\)\.\s]/.test(cleanExpression)) {
        throw new Error(
          "Invalid characters detected in mathematical expression.",
        );
      }

      // Safe assessment function using standard JavaScript evaluation logic
      const evaluation = new Function(`return (${cleanExpression});`)();
      return String(evaluation);
    } catch (error) {
      return `Error calculating: ${error.message}`;
    }
  },
  {
    name: "calculator_tool",
    description:
      "Evaluates basic mathematical expressions like '25 + 17' or '100 / 4'",
    schema: z.object({
      expression: z.string().describe("A math expression string to evaluate."),
    }),
  },
);

const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const llm = new ChatOllama({
  model: "gemma4:cloud",
  baseUrl: baseUrl,
  temperature: 0, // Low temperature for high math/logic accuracy
});

// Bind the tool to the LLM
const llmWithCalculator = llm.bindTools([calculatorTool]);

async function classifyNode(state) {
  console.log("   🔄 Analyzing query type...");
  await sleep(2000);

  const queryLower = state.query.toLowerCase();
  const mathKeywords = [
    "+",
    "-",
    "*",
    "/",
    "plus",
    "minus",
    "times",
    "divided",
    "calculate",
    "sum",
  ];
  const isMath = mathKeywords.some((keyword) => queryLower.includes(keyword));

  if (isMath) {
    console.log("   ✅ Detected mathematical query");
  } else {
    console.log("   ℹ️ Non-mathematical query");
  }

  return { is_math: isMath };
}

function router(state) {
  if (state.is_math) {
    return "calculator";
  }
  return "general";
}

async function calculatorNode(state) {
  console.log("   🔄 Processing mathematical query...");
  console.log("   📊 Invoking calculator tool with LLM...");
  await sleep(2000);

  const prompt = `Calculate the following using the calculator tool: ${state.query}`;
  const response = await llmWithCalculator.invoke(prompt);

  let answer = "";

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    console.log(`   🔧 Tool called: ${toolCall.name}`);
    console.log(`   📝 Expression: ${toolCall.args.expression}`);

    answer = await calculatorTool.invoke(toolCall.args);
  } else {
    answer = response.content.trim();
  }

  console.log("   ✅ Calculator returned result");
  await sleep(1000);

  return { result: `Answer: ${answer}` };
}

async function generalResponseNode(state) {
  console.log("   🔄 Processing non-mathematical query...");
  await sleep(2000);
  console.log("   ℹ️ Providing general response");
  return { result: "This is not a math question. Please ask a calculation!" };
}

printBuildingMessage();

const workflow = new StateGraph({ channels: StateAnnotation });

workflow.addNode("classify", classifyNode);
workflow.addNode("calculator_agent", calculatorNode);
workflow.addNode("general_agent", generalResponseNode);

workflow.addEdge(START, "classify");
workflow.addConditionalEdges("classify", router, {
  calculator: "calculator_agent",
  general: "general_agent",
});

workflow.addEdge("calculator_agent", END);
workflow.addEdge("general_agent", END);

const app = workflow.compile();
console.log("Graph compiled! Testing calculator...\n");

function printBuildingMessage() {
  console.log("Building calculator graph:\n");
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("TEST 1: Math query");
  console.log("=".repeat(60));
  const test1 = await app.invoke({
    query: "What is 25 plus 17?",
    is_math: false,
    result: "",
  });
  console.log(`Query: '${test1.query}'`);
  console.log(`Result: ${test1.result}\n`);

  // Test with non-math query
  console.log("=".repeat(60));
  console.log("TEST 2: Non-math query");
  console.log("=".repeat(60));
  const test2 = await app.invoke({
    query: "What is the weather today?",
    is_math: false,
    result: "",
  });
  console.log(`Query: '${test2.query}'`);
  console.log(`Result: ${test2.result}`);

  console.log("\n" + "=".repeat(60));
  console.log("💡 KEY CONCEPTS:");
  console.log(
    "- Tools are structured functions utilizing standard Zod validations schemas",
  );
  console.log(
    "- bindTools() attaches tools natively onto standard ChatOllama LLM engines",
  );
  console.log(
    "- LangGraph conditional routing dynamically intercepts tool executions contextually",
  );
  console.log("=".repeat(60));

  console.log("\n✅ Task 6 completed!");
}

runTests();
