const fs = require("fs");
const path = require("path");

const repoDir = path.resolve(__dirname, "..");
const docsDir = path.join(repoDir, "docs");
const outDir = path.join(docsDir, "flowcharts");
const brainDir =
  "C:\\Users\\Kaizer\\.gemini\\antigravity\\brain\\0dbc6d95-99a1-4087-bf50-162a062fe9ae";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const markdownPath = path.join(docsDir, "APP_FLOWCHART.md");
const content = fs.readFileSync(markdownPath, "utf8");

// Extract mermaid blocks
const mermaidRegex = /```mermaid([\s\S]*?)```/g;
const blocks = [];
let match;
while ((match = mermaidRegex.exec(content)) !== null) {
  blocks.push(match[1].trim());
}

console.log(`Found ${blocks.length} mermaid diagrams.`);

const filenames = [
  "01-architecture-data-flow.png",
  "02-authentication-onboarding-flow.png",
  "03-inventory-lifecycle-flow.png",
  "04-roles-permission-matrix.png",
];

async function generatePng(code, filename) {
  console.log(`Generating ${filename}...`);
  let buffer;

  // Try Kroki first (handles complex diagrams, multi-line labels, and custom themes cleanly)
  try {
    const res = await fetch("https://kroki.io/mermaid/png", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: code,
    });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
  } catch (krokiErr) {
    console.warn(
      `Kroki attempt failed for ${filename}, trying mermaid.ink fallback...`,
    );
  }

  // Fallback to mermaid.ink
  if (!buffer) {
    const payload = { code, mermaid: { theme: "default" } };
    const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
    const url = `https://mermaid.ink/img/${b64}?type=png`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${filename} from both renderers: HTTP ${res.status}`,
      );
    }
    const arrayBuffer = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved ${outPath} (${buffer.length} bytes)`);

  if (fs.existsSync(brainDir)) {
    const brainPath = path.join(brainDir, filename);
    fs.writeFileSync(brainPath, buffer);
  }
}

async function run() {
  for (let i = 0; i < blocks.length; i++) {
    const name = filenames[i] || `flowchart-${i + 1}.png`;
    try {
      await generatePng(blocks[i], name);
    } catch (err) {
      console.error(`Error generating ${name}:`, err.message);
    }
  }
  console.log("Done generating all flowchart PNGs!");
}

run();
