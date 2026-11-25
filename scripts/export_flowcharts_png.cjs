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
  "00-master-system-flowchart.png",
  "01-architecture-data-flow.png",
  "02-authentication-onboarding-flow.png",
  "03-inventory-lifecycle-flow.png",
  "04-roles-permission-matrix.png",
];

async function generatePng(code, filename) {
  console.log(`Generating ${filename} with solid white background...`);

  // Strip %% comment lines and init blocks for clean mermaid.ink URL payload
  const cleanCode = code
    .split("\n")
    .filter((l) => !l.trim().startsWith("%%"))
    .join("\n");

  const payload = {
    code: cleanCode,
    mermaid: {
      theme: "default",
      themeVariables: {
        darkMode: false,
        background: "#ffffff",
        primaryColor: "#ffffff",
        primaryBorderColor: "#94a3b8",
        primaryTextColor: "#0f172a",
        lineColor: "#475569",
        secondaryColor: "#f8fafc",
        secondaryBorderColor: "#cbd5e1",
        secondaryTextColor: "#0f172a",
        tertiaryColor: "#f1f5f9",
        tertiaryBorderColor: "#cbd5e1",
        tertiaryTextColor: "#0f172a",
      },
    },
  };

  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const url = `https://mermaid.ink/img/${b64}?bgColor=ffffff&type=png`;

  let buffer;
  const res = await fetch(url);
  if (res.ok) {
    const arrayBuffer = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    // Fallback: simple payload
    const fallbackPayload = { code: cleanCode, mermaid: { theme: "default" } };
    const fb64 = Buffer.from(JSON.stringify(fallbackPayload)).toString(
      "base64",
    );
    const fbUrl = `https://mermaid.ink/img/${fb64}?bgColor=ffffff&type=png`;
    const fbRes = await fetch(fbUrl);
    if (!fbRes.ok) {
      throw new Error(
        `Failed to generate ${filename}: HTTP ${res.status} / Fallback HTTP ${fbRes.status}`,
      );
    }
    buffer = Buffer.from(await fbRes.arrayBuffer());
  }

  const colorType = buffer[25];
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(
    `Saved ${filename} (${buffer.length} bytes, ColorType=${colorType} [${colorType === 2 ? "Solid White RGB (No Alpha)" : "RGBA"}])`,
  );

  if (fs.existsSync(brainDir)) {
    const brainPath = path.join(brainDir, filename);
    fs.writeFileSync(brainPath, buffer);
  }
}

async function run() {
  for (let i = 0; i < blocks.length; i++) {
    const name = filenames[i] || `flowchart-${i}.png`;
    try {
      await generatePng(blocks[i], name);
    } catch (err) {
      console.error(`Error generating ${name}:`, err.message);
    }
  }
  console.log(
    "Done generating all flowchart PNGs with solid white background!",
  );
}

run();
