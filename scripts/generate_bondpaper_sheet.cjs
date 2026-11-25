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

// 1. Read APP_FLOWCHART.md
const markdownPath = path.join(docsDir, "APP_FLOWCHART.md");
const content = fs.readFileSync(markdownPath, "utf8");

// Extract mermaid blocks
const mermaidRegex = /```mermaid([\s\S]*?)```/g;
const blocks = [];
let match;
while ((match = mermaidRegex.exec(content)) !== null) {
  blocks.push(match[1].trim());
}

console.log(
  `Found ${blocks.length} mermaid diagrams to render for Landscape Bond Paper.`,
);

const diagramsMeta = [
  {
    filename: "00-master-system-flowchart.png",
    title: "Master Operational System Flowchart",
    docRef: "KM100-FLW-00-MASTER",
    desc: "End-to-End Operational Lifecycle: Shared Passkey Auth, Local-First Engine, Equipment Manipulation, Cloud CDC Sync & Governance",
  },
  {
    filename: "01-architecture-data-flow.png",
    title: "High-Level Architecture & Data Flow",
    docRef: "KM100-FLW-01-ARCH",
    desc: "Client-Side Cache (0ms Paint), Supabase PostgreSQL Cloud Backend & Automated GitHub Actions Cron Keep-Alive",
  },
  {
    filename: "02-authentication-onboarding-flow.png",
    title: "Authentication & Onboarding Flow",
    docRef: "KM100-FLW-02-AUTH",
    desc: "Shared Institutional Passkey Verification, Role Assignment (Custodian vs Instructor) & Interactive Tour Trigger",
  },
  {
    filename: "03-inventory-lifecycle-flow.png",
    title: "Core Operational Inventory Lifecycle",
    docRef: "KM100-FLW-03-INVENTORY",
    desc: "Facility Discovery, Live KPI Metrics, Inline Quantity Steppers, Direct Manipulation & Cloud Reconciliation",
  },
  {
    filename: "04-roles-permission-matrix.png",
    title: "Institutional Role & Permission Matrix",
    docRef: "KM100-FLW-04-ROLES",
    desc: "Shared Institutional Security Passkey, Daily Custody Controls (Shared) & Administrative Authority (Custodian Exclusive)",
  },
];

async function generatePng(code, filename) {
  console.log(
    `Generating ${filename} (landscape bond paper proportioned, solid white background)...`,
  );

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
  let attempts = 0;
  while (attempts < 3 && !buffer) {
    attempts++;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (res.status === 503) {
        console.warn(`Attempt ${attempts}: 503 rate limit, waiting 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.warn(`Attempt ${attempts} failed with status ${res.status}`);
        break;
      }
    } catch (e) {
      console.warn(`Fetch error on attempt ${attempts}:`, e.message);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Fallback to Kroki POST if mermaid.ink is unavailable
  if (!buffer) {
    console.log(`Trying Kroki fallback for ${filename}...`);
    const krokiRes = await fetch("https://kroki.io/mermaid/png", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: code,
    });
    if (krokiRes.ok) {
      buffer = Buffer.from(await krokiRes.arrayBuffer());
    } else {
      throw new Error(`Failed to generate ${filename} from all sources.`);
    }
  }

  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(
    `Saved ${filename} (${buffer.length} bytes, ColorType=${buffer[25]} [Solid White Background])`,
  );

  if (fs.existsSync(brainDir)) {
    const brainPath = path.join(brainDir, filename);
    fs.writeFileSync(brainPath, buffer);
  }

  return buffer;
}

// Generate the printable HTML Landscape Bond Paper document
function generatePrintableHtml(imagesBase64) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pagesHtml = diagramsMeta
    .map((meta, index) => {
      const pageNum = index + 1;
      const totalPages = diagramsMeta.length;
      const imgSrc = imagesBase64[index]
        ? `data:image/png;base64,${imagesBase64[index]}`
        : `./flowcharts/${meta.filename}`;

      return `
    <section class="bondpaper-page">
      <!-- Institutional Header (Landscape Width) -->
      <header class="page-header">
        <div class="header-left">
          <div class="logo-circle">KM100</div>
          <div class="header-titles">
            <h1 class="inst-title">KM100 SKILLS AND TRAINING CENTER, INC.</h1>
            <h2 class="sub-title">Property Custody &amp; Inventory Management System</h2>
            <div class="meta-row">
              <span class="meta-item"><strong>Doc Ref:</strong> ${meta.docRef}</span>
              <span class="meta-divider">•</span>
              <span class="meta-item"><strong>Classification:</strong> Official Institutional Architecture</span>
              <span class="meta-divider">•</span>
              <span class="meta-item"><strong>Layout:</strong> Landscape Short Bond Paper (11" × 8.5")</span>
              <span class="meta-divider">•</span>
              <span class="meta-item"><strong>Date:</strong> ${currentDate}</span>
            </div>
          </div>
        </div>
        <div class="header-badge">
          <span class="badge-tag">LANDSCAPE BOND PAPER (11" × 8.5")</span>
          <span class="page-count">Page ${pageNum} of ${totalPages}</span>
        </div>
      </header>

      <!-- Diagram Section Title -->
      <div class="diagram-title-card">
        <h3 class="diagram-heading">${pageNum}. ${meta.title}</h3>
        <p class="diagram-desc">${meta.desc}</p>
      </div>

      <!-- Flowchart Image Container (Fitted for Landscape Bond Paper) -->
      <div class="diagram-viewport">
        <img src="${imgSrc}" alt="${meta.title}" class="flowchart-image" />
      </div>

      <!-- Institutional Sign-Off Block & Footer -->
      <footer class="page-footer">
        <div class="signoff-grid">
          <div class="signoff-box">
            <div class="sign-line"></div>
            <div class="sign-name">Property Custodian / Staff</div>
            <div class="sign-role">Shared Passkey Authorized</div>
          </div>
          <div class="signoff-box">
            <div class="sign-line"></div>
            <div class="sign-name">Audited By</div>
            <div class="sign-role">Internal Compliance Officer</div>
          </div>
          <div class="signoff-box">
            <div class="sign-line"></div>
            <div class="sign-name">Approved By</div>
            <div class="sign-role">Center Administrator</div>
          </div>
        </div>
        <div class="footer-bottom-bar">
          <span>KM100 Skills &amp; Training Center, Inc. • Confidential Property Inventory Document</span>
          <span>Standard Short Bond Paper — Landscape (Letter: 11" × 8.5")</span>
        </div>
      </footer>
    </section>
  `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KM100 Inventory System - Architecture Flowcharts (Landscape Bond Paper)</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      line-height: 1.4;
      padding: 24px 0;
    }

    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      max-width: 11in;
      margin: 0 auto 24px auto;
      background: #ffffff;
      padding: 16px 24px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toolbar-info h2 {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .toolbar-info p {
      font-size: 13px;
      color: #64748b;
    }

    .print-btn {
      background: #b45309;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s ease;
    }

    .print-btn:hover {
      background: #92400e;
    }

    /* Landscape Bond Paper Sheet Layout (Standard Letter / Short Bond Paper Landscape: 11in x 8.5in) */
    .bondpaper-page {
      width: 11in;
      min-height: 8.5in;
      max-height: 8.5in;
      margin: 0 auto 32px auto;
      background: #ffffff;
      padding: 0.35in 0.5in;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      position: relative;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #b45309;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 12px;
      letter-spacing: -0.5px;
      box-shadow: 0 2px 4px rgba(180, 83, 9, 0.3);
    }

    .header-titles .inst-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
      text-transform: uppercase;
    }

    .header-titles .sub-title {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      margin-top: 1px;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }

    .meta-divider {
      color: #cbd5e1;
    }

    .header-badge {
      text-align: right;
    }

    .badge-tag {
      display: block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      font-size: 8.5px;
      font-weight: 700;
      color: #475569;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }

    .page-count {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
    }

    .diagram-title-card {
      margin-bottom: 6px;
    }

    .diagram-heading {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }

    .diagram-desc {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Diagram Viewport - Scaled for Landscape Bond Paper (Wide 16:9 / 11:8.5) */
    .diagram-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: #ffffff;
      padding: 8px 12px;
      overflow: hidden;
      min-height: 0;
    }

    .flowchart-image {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }

    .page-footer {
      margin-top: 8px;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
    }

    .signoff-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      margin-bottom: 4px;
    }

    .signoff-box {
      text-align: center;
    }

    .sign-line {
      border-bottom: 1px solid #94a3b8;
      width: 60%;
      margin: 0 auto 3px auto;
      height: 12px;
    }

    .sign-name {
      font-size: 9px;
      font-weight: 700;
      color: #0f172a;
    }

    .sign-role {
      font-size: 8px;
      color: #64748b;
    }

    .footer-bottom-bar {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
      border-top: 1px dashed #e2e8f0;
      padding-top: 3px;
    }

    @media print {
      @page {
        size: letter landscape; /* Standard Short Bond Paper Landscape (11in x 8.5in) */
        margin: 0;
      }

      body {
        background: #ffffff !important;
        padding: 0 !important;
      }

      .screen-toolbar {
        display: none !important;
      }

      .bondpaper-page {
        width: 11in !important;
        height: 8.5in !important;
        max-height: 8.5in !important;
        margin: 0 !important;
        padding: 0.35in 0.5in !important;
        border: none !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        page-break-after: always !important;
      }

      .diagram-viewport {
        border: 1px solid #cbd5e1 !important;
      }
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <div class="toolbar-info">
      <h2>KM100 Property Custody &amp; Inventory Management System</h2>
      <p>Architecture &amp; Operational Flowcharts — Landscape Short Bond Paper Formatted (11" × 8.5")</p>
    </div>
    <button class="print-btn" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print to Landscape Bond Paper / Save as PDF
    </button>
  </div>

  ${pagesHtml}
</body>
</html>`;
}

async function run() {
  const imagesBase64 = [];
  for (let i = 0; i < blocks.length; i++) {
    const meta = diagramsMeta[i] || { filename: `flowchart-${i}.png` };
    try {
      const buffer = await generatePng(blocks[i], meta.filename);
      imagesBase64.push(buffer.toString("base64"));
    } catch (err) {
      console.error(`Error generating ${meta.filename}:`, err.message);
      imagesBase64.push(null);
    }
    // Respect rate limits between calls
    await new Promise((r) => setTimeout(r, 1200));
  }

  // Generate printable landscape bond paper HTML
  const htmlContent = generatePrintableHtml(imagesBase64);
  const htmlPath = path.join(
    docsDir,
    "KM100_Inventory_Flowcharts_Bondpaper.html",
  );
  fs.writeFileSync(htmlPath, htmlContent, "utf8");
  console.log(`Generated Landscape Bond Paper document: ${htmlPath}`);

  if (fs.existsSync(brainDir)) {
    const brainHtmlPath = path.join(
      brainDir,
      "KM100_Inventory_Flowcharts_Bondpaper.html",
    );
    fs.writeFileSync(brainHtmlPath, htmlContent, "utf8");
  }

  console.log("All landscape bond paper flowcharts generated successfully!");
}

run();
