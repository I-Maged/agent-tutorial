import { StateGraph, START, END } from "@langchain/langgraph";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🎯 Task 4: Complete LangGraph Flow\n");

const StateAnnotation = {
  topic: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  outline: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  draft: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
  final: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
};

async function outlineNode(state) {
  console.log("   🔄 Creating outline...");
  await sleep(2000);
  const outline = `Outline for '${state.topic}':\n1. Introduction\n2. Main Points\n3. Conclusion`;
  return { outline: outline };
}

async function draftNode(state) {
  console.log("   🔄 Writing draft...");
  await sleep(2000);
  const draft = `Draft: Expanding on the outline for '${state.topic}'...`;
  return { draft: draft };
}

async function reviewNode(state) {
  console.log("   🔄 Reviewing and finalizing...");
  await sleep(2000);
  const final = `Final: Reviewed and polished content about '${state.topic}'. Ready to publish!`;
  return { final: final };
}

console.log("Building multi-step workflow:\n");

const workflow = new StateGraph({ channels: StateAnnotation });

workflow.addNode("create_outline", outlineNode);
workflow.addNode("write_draft", draftNode);
workflow.addNode("finalize_review", reviewNode);

workflow.addEdge(START, "create_outline");
workflow.addEdge("create_outline", "write_draft");
workflow.addEdge("write_draft", "finalize_review");
workflow.addEdge("finalize_review", END);

console.log("Compiling graph...");
const app = workflow.compile();
console.log("Graph compiled! Running workflow...\n");

async function runWorkflow() {
  const result = await app.invoke({
    topic: "LangGraph Basics",
    outline: "",
    draft: "",
    final: "",
  });

  console.log("\n" + "=".repeat(60));
  console.log("WORKFLOW RESULTS:");
  console.log(`Topic: {result.topic}`);
  console.log(`Outline: {result.outline.slice(0, 50)}...`);
  console.log(`Draft: {result.draft.slice(0, 50)}...`);
  console.log(`Final: {result.final}`);
  console.log("=".repeat(60));

  console.log("\n💡 KEY CONCEPTS:");
  console.log(
    "- JavaScript LangGraph node names must be distinct from state attributes.",
  );
  console.log("- Multi-node workflows process data in stages");
  console.log("- State accumulates data from each node dynamically");

  console.log("\n✅ Task 4 completed!");
}

runWorkflow();
