import { START, END, StateGraph } from "@langchain/langgraph";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🔀 Task 5: Conditional Routing\n");

const StateAnnotation = {
  query: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  query_length: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  response: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
};

async function analyzeNode(state) {
  console.log("  🔄 Analyzing query length...");
  await sleep(2000);
  const length = state.query.length < 20 ? "short" : "long";
  return { query_length: length };
}

function router(state) {
  return state.query_length === "short" ? "quick" : "detailed";
}

async function quickResponseNode(state) {
  console.log("  🔄 Processing quick response...");
  await sleep(2000);
  const response = `Quick answer: ${state.query.slice(0, 20)}`;
  return { response: response };
}

async function detailedResponseNode(state) {
  console.log("  🔄 Processing detailed analysis...");
  await sleep(2000);
  const response = `Detailed analysis: Let me thoroughly explain ${state.query}`;
  return { response: response };
}

console.log("Building conditional routing graph:\n");

const workflow = new StateGraph({ channels: StateAnnotation });

workflow.addNode("analyze", analyzeNode);
workflow.addNode("quick_reply", quickResponseNode);
workflow.addNode("detailed_reply", detailedResponseNode);

workflow.addEdge(START, "analyze");

workflow.addConditionalEdges("analyze", router, {
  quick: "quick_reply",
  detailed: "detailed_reply",
});

workflow.addEdge("quick_reply", END);
workflow.addEdge("detailed_reply", END);

const app = workflow.compile();

console.log("Graph compiled! Testing routing...\n");

async function runTests() {
  // Test with short query
  console.log("=".repeat(60));
  console.log("TEST 1: Short query");
  console.log("=".repeat(60));
  const result1 = await app.invoke({
    query: "What is Python?",
    query_length: "",
    response: "",
  });
  console.log(`Query: '${result1.query}'`);
  console.log(`Route taken: ${result1.query_length} → quick`);
  console.log(`Response: ${result1.response}\n`);

  // Test with long query
  console.log("=".repeat(60));
  console.log("TEST 2: Long query");
  console.log("=".repeat(60));
  const result2 = await app.invoke({
    query: "Explain how LangGraph conditional routing works in detail",
    query_length: "",
    response: "",
  });
  console.log(`Query: '${result2.query}'`);
  console.log(`Route taken: ${result2.query_length} → detailed`);
  console.log(`Response: ${result2.response}`);

  console.log("\n" + "=".repeat(60));
  console.log("💡 KEY CONCEPTS:");
  console.log(
    "- Router functions examine state attributes asynchronously or synchronously",
  );
  console.log("- Return strings matching routing key mappings");
  console.log("- addConditionalEdges maps returns to isolated Node names");
  console.log(
    "- Different inputs change the system execution graph path seamlessly",
  );
  console.log("=".repeat(60));

  console.log("\n✅ Task 5 completed!");
}
runTests();
