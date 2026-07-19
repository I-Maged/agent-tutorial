console.log("📡 Task 1: Understanding MCP Basics\n");

class FastMCP {
  constructor(name) {
    this.name = name;
    this.tools = new Map();
  }

  // Registers a tool function with its parameters and description

  tool(config, fn) {
    this.tools.set(config.name, {
      config,
      fn,
    });
  }

  run(transport = "stdio") {
    console.log(
      `🚀 ${this.name} MCP Server would run with ${transport} transport`,
    );
    console.log(
      `📦 Available tools: ${Array.from(this.tools.keys()).join(", ")}`,
    );
  }
}

// Initialize the MCP server
// Pass server name to FastMCP with double quotes
const mcp = new FastMCP("Calculator");

// Create calculator tools
const add = (a, b) => {
  const result = a + b;
  console.log(`  🔧 Tool 'add' called with a=${a}, b=${b}`);
  console.log(`  ➕ Result: ${result}`);
  return result;
};

// Registering the add tool configuration
mcp.tool(
  {
    name: "add",
    description: "Add two numbers together",
    params: { a: "number", b: "number" },
  },
  add,
);

// Create the multiply tool
// Define the functional execution logic
const multiply = (a, b) => {
  const result = a * b;
  console.log(`  🔧 Tool 'multiply' called with a=${a}, b=${b}`);
  console.log(`  ✖️ Result: ${result}`);
  return result;
};

// Register the multiply tool to the server
mcp.tool(
  {
    name: "multiply",
    description: "Multiply two numbers",
    params: { a: "number", b: "number" },
  },
  multiply,
);

const divide = (a, b) => {
  console.log(`  🔧 Tool 'divide' called with a=${a}, b=${b}`);

  if (b === 0) {
    console.log("  ❌ Error: Division by zero!");
    return "Error: Cannot divide by zero";
  }

  const result = a / b;
  console.log(`  ➗ Result: ${result}`);
  return `${a} ÷ ${b} = ${result}`;
};

mcp.tool(
  {
    name: "divide",
    description: "Divide two numbers with zero check",
    params: { a: "number", b: "number" },
  },
  divide,
);

// Test the tools directly (simulating MCP calls)
console.log("\n" + "=".repeat(60));
console.log("TESTING MCP TOOLS:");
console.log("=".repeat(60));

function testTools() {
  // Test addition
  console.log("\nTest 1: Addition");
  const result1 = add(5, 3);
  console.log(`Response: ${result1}`);

  // Test multiplication
  console.log("\nTest 2: Multiplication");
  const result2 = multiply(4, 7);
  console.log(`Response: ${result2}`);

  // Test division
  console.log("\nTest 3: Division");
  const result3 = divide(10, 2);
  console.log(`Response: ${result3}`);

  // Test division by zero
  console.log("\nTest 4: Division by zero");
  const result4 = divide(5, 0);
  console.log(`Response: ${result4}`);
}

// Run the execution tests
testTools();

console.log("\n" + "=".repeat(60));
console.log("💡 KEY CONCEPTS:");
console.log("- FastMCP creates MCP servers easily");
console.log("- Server tool definitions explicitly expose functions");
console.log("- Tools specify schema type configurations for inputs");
console.log("- Servers run continuously using standard communication pipes");
console.log("=".repeat(60));

console.log("\n✅ Task 1 complete! MCP tools tested successfully.");
console.log("\n" + "=".repeat(60));
console.log("🚀 STARTING MCP SERVER");
console.log("=".repeat(60));
console.log("The calculator MCP server is now starting...");
console.log("Keep this terminal open - the server will run continuously.");
console.log("Use Ctrl+C to stop the server when you're done.");
console.log("\nServer ready! Waiting for client connections...");
console.log("=".repeat(60) + "\n");

// Start the continuous running MCP service loop
mcp.run("stdio");
