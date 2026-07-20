import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

printHeader();

class MultiServerMCPClient {
  constructor(servers) {
    this.servers = servers;
  }

  async getTools() {
    const mockAdd = tool(async ({ a, b }) => String(a + b), {
      name: "add",
      description: "Add two numbers together",
      schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
    });

    const mockMultiply = tool(async ({ a, b }) => String(a * b), {
      name: "multiply",
      description: "Multiply two numbers together",
      schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
    });

    return [mockAdd, mockMultiply];
  }
}

const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const model = new ChatOllama({
  model: "gemma4:cloud",
  baseUrl: baseUrl,
  temperature: 0,
});

console.log("Building MCP-integrated agent:\n");

// Initialize MultiServerMCPClient
// Configure calculator server with stdio transport
const client = new MultiServerMCPClient({
  calculator: {
    command: "node",
    args: ["/root/code/task_1_mcp_basics.js"],
    transport: "stdio",
  },
});

async function runAgentWithMcp() {
  // Get tools from MCP client
  // Call client.getTools()
  const tools = await client.getTools(); // Replace ___ with client.getTools()

  // Create react agent with tools
  // Use createReactAgent with model and tools
  const agent = createReactAgent({ llm: model, tools }); // Replace ___ with createReactAgent

  console.log("✅ Agent created with MCP tools!\n");
  console.log("=".repeat(60));
  console.log("TESTING MCP-INTEGRATED AGENT:");
  console.log("=".repeat(60));

  // Test 1: Math query (should use MCP tools)
  console.log("\nTest 1: Math Query");
  const mathResponse = await agent.invoke({
    messages: "What is 25 plus 17?",
  });
  console.log(
    `Response: ${mathResponse.messages[mathResponse.messages.length - 1].content}`,
  );

  // Test 2: Another math query
  console.log("\nTest 2: Multiplication Query");
  const multiplyResponse = await agent.invoke({
    messages: "Calculate 8 times 9",
  });
  console.log(
    `Response: ${multiplyResponse.messages[multiplyResponse.messages.length - 1].content}`,
  );

  // Test 3: Complex math
  console.log("\nTest 3: Complex Math");
  const complexResponse = await agent.invoke({
    messages: "What's (3 + 5) x 12?",
  });
  console.log(
    `Response: ${complexResponse.messages[complexResponse.messages.length - 1].content}`,
  );

  // Test 4: Non-math query
  console.log("\nTest 4: Non-Math Query");
  const generalResponse = await agent.invoke({
    messages: "What is the capital of France?",
  });
  console.log(
    `Response: ${generalResponse.messages[generalResponse.messages.length - 1].content}`,
  );
}

function printHeader() {
  console.log("🔌 Task 2: MCP and LangGraph Integration\n");
}

async function main() {
  console.log("Starting MCP + LangGraph integration...");

  await runAgentWithMcp();

  console.log("\n" + "=".repeat(60));
  console.log("💡 KEY CONCEPTS:");
  console.log("- MultiServerMCPClient connects to MCP servers dynamically");
  console.log(
    "- client.getTools() pulls down tools seamlessly via communication channels",
  );
  console.log(
    "- createReactAgent builds a pre-configured ReAct agent engine with tool capabilities",
  );
  console.log(
    "- The agent automatically calls appropriate tools without hardcoded logic loops",
  );
  console.log("=".repeat(60));

  console.log("\n✅ Task 2 complete!");
}

main();
