// import OpenAI from "openai";
// import path, { dirname, resolve } from "path";
// import { fileURLToPath } from "url";
// import dotenv from "dotenv";

// const __dirname = dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: resolve(__dirname, "../.env") });

// const apiKey = process.env.OPENAI_API_KEY;
// const baseUrl = process.env.OPENAI_API_BASE;

// const client = new OpenAI({
//   apiKey: apiKey,
// });

// const completion = await client.chat.completions.create({
//   //   model: "gpt-4o-mini",
//   model: "openai/gpt-4.1-mini",
//   messages: [
//     {
//       role: "user",
//       content: "Hello AI, please introduce yourself",
//     },
//   ],
// });

// console.log(completion.choices[0].message.content);

import ollama from "ollama";

const response = await ollama.chat({
  model: "gemma4:cloud",
  //   model: "nemotron-3-super:cloud",
  messages: [{ role: "user", content: "Hello AI, please introduce yourself!" }],
});
console.log(response);
// console.log(response.message.content);
