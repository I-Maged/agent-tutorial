const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🔷 Task 2: Creating Your First Node\n");

async function greetNode(state) {
  console.log("   🔄 Processing in greetNode...");
  await sleep(2000);
  const greeting = `Hello, ${state.name}!`;
  return { greeting: greeting };
}

async function enhanceNode(state) {
  console.log("   🔄 Processing in enhanceNode...");
  await sleep(2000);
  const enhanced = state.greeting + " How are you?";
  return { greeting: enhanced };
}

async function runTest() {
  console.log("Testing nodes manually:\n");

  const initialState = { name: "Alice", greeting: "" };
  console.log(`Initial state: ${JSON.stringify(initialState)}`);

  console.log("\nCalling greetNode...");
  const update1 = await greetNode(initialState);
  console.log(`Node returned: ${JSON.stringify(update1)}`);

  const stateAfterGreet = { name: "Alice", greeting: update1.greeting };
  console.log(`State after greet: ${JSON.stringify(stateAfterGreet)}`);

  console.log("\nCalling enhanceNode...");
  const update2 = await enhanceNode(stateAfterGreet);
  console.log(`Node returned: ${JSON.stringify(update2)}`);

  const finalState = { name: "Alice", greeting: update2.greeting };
  console.log(`Final state: ${JSON.stringify(finalState)}`);

  console.log("\n" + "=".repeat(60));
  console.log("💡 KEY CONCEPTS:");
  console.log(
    "- Nodes are JavaScript functions that take state and return updates",
  );
  console.log("- We're testing functions here WITHOUT a graph");
  console.log("- In Task 3, we'll add these functions to a StateGraph");
  console.log(
    "- LangGraph will handle state merging automatically in a real graph",
  );
  console.log("=".repeat(60));

  console.log("\n✅ Task 2 completed!");
}

runTest();
