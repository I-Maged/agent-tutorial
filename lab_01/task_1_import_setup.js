// Task 1: Import Required Libraries

import OpenAI from "openai";

import fs from "fs";
import path from "path";

console.log("✅ Step 1 Complete: Libraries imported!");
console.log("- openai: For making API calls");
console.log("- os: For accessing environment variables");

// Create marker
const dir = "/root/markers";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(path.join(dir, "task1_imports_complete.txt"), "SUCCESS");
