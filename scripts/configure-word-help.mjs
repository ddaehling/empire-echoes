import { writeFile } from "node:fs/promises";
const input = process.argv[2];
let endpoint;
try {
  endpoint = new URL(input);
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || !["/", "/explain"].includes(endpoint.pathname)) throw new Error();
  endpoint.pathname = "/explain";
} catch {
  console.error("Usage: node scripts/configure-word-help.mjs https://YOUR-WORKER.workers.dev\nSupply the public Worker URL, never an API key.");
  process.exit(1);
}
await writeFile(new URL("../app/journey/js/word-help-config.js", import.meta.url), `// Public service address only. The OpenAI key belongs in Cloudflare Secrets.\nexport const wordHelpEndpoint = ${JSON.stringify(endpoint.href)};\n`);
console.log("Word help service configured. Publish the changed configuration to GitHub Pages.");
