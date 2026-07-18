import { StateGraph, START, END } from "@langchain/langgraph";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🔗 Task 3: Connecting Nodes with Edges\n");

const StateAnnotation = {
  name: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  greeting: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
};

// Our nodes from Task 2 (adapted for async execution)
async function greetNode(state) {
  console.log("   🔄 Processing in greetNode...");
  await sleep(2000);
  const greeting = `Hello, ${state.name}!`;
  return { greeting: greeting };
}

async function enhanceNode(state) {
  console.log("   🔄 Processing in enhanceNode...");
  await sleep(2000);
  const enhanced = state.greeting + " Welcome to LangGraph!";
  return { greeting: enhanced };
}

console.log("Building your first graph:\n");

// Create a StateGraph with our State schema definition
const workflow = new StateGraph({ channels: StateAnnotation });

// Add nodes to the graph
workflow.addNode("greet", greetNode);
workflow.addNode("enhance", enhanceNode);

// Connect nodes with edges
workflow.addEdge(START, "greet");
workflow.addEdge("greet", "enhance");
workflow.addEdge("enhance", END);

// Compile the graph
console.log("Compiling graph...");
const app = workflow.compile();
console.log("✅ Graph compiled successfully!\n");

// Run the graph!
async function runGraph() {
  console.log("Running the graph:");
  const result = await app.invoke({ name: "Bob", greeting: "" });

  console.log(`\nFinal result: ${JSON.stringify(result)}`);

  console.log("\n" + "=".repeat(60));
  console.log("💡 KEY CONCEPTS:");
  console.log("- StateGraph: Container for your workflow");
  console.log("- addNode: Registers an async function as a node");
  console.log("- START: Special marker where execution begins");
  console.log("- addEdge: Connects nodes in order (A → B)");
  console.log("- END: Special marker for final node");
  console.log(
    "- compile: Converts graph structure to an executable app runner",
  );
  console.log("=".repeat(60));

  console.log("\n✅ Task 3 completed!");
}

runGraph();
