import { StateGraph, END } from "@langchain/langgraph";

console.log("📚 Task 1: Understanding Imports\n");

// Define State structure
const StateAnnotation = {
  messages: {
    value: (x, y) => x.concat(y),
    default: () => [],
  },
  next_step: {
    value: (x, y) => y ?? x,
    default: () => "",
  },
};

console.log("Testing imports...");

try {
  const testGraph = new StateGraph({ channels: StateAnnotation });

  console.log("✅ StateGraph imported and initialized successfully!");
  console.log(
    `✅ State fields configured: ${Object.keys(StateAnnotation).join(", ")}`,
  );
  console.log(`✅ END constant is available: ${END}`);
} catch (error) {
  console.error("❌ Complete the TODOs to make imports work!", error);
}

console.log("\n" + "=".repeat(60));
console.log("💡 KEY CONCEPTS:");
console.log("- StateGraph: Creates stateful workflow graphs");
console.log("- END: Marks the final node in a graph");
console.log(
  "- StateAnnotation: Defines the properties and reducer functions of our state",
);
console.log("- State: Data that flows dynamically through all nodes");
console.log("=".repeat(60));

console.log("\n✅ Task 1 completed!");
