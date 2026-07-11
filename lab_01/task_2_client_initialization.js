import OpenAI from "openai";
import fs from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const apiKey = process.env.OPENAI_API_KEY;
const baseUrl = process.env.OPENAI_API_BASE;

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: baseUrl,
});

console.log("✅ Step 2 Complete: Connected to OpenAI!");
console.log(`- API Key: ${apiKey?.substring(0, 10)}...`);
console.log(`- Base URL: ${baseUrl}`);

const markerDir = "/root/markers";

if (!fs.existsSync(markerDir)) {
  fs.mkdirSync(markerDir, { recursive: true });
}

fs.writeFileSync(path.join(markerDir, "task2_client_complete.txt"), "SUCCESS");
