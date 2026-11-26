const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoDir = path.resolve(__dirname, "..");
const docsDir = path.join(repoDir, "docs");
const outDir = path.join(docsDir, "flowcharts");
const mmdPath = path.join(docsDir, "ims-user-flow.mmd");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Precision SVG Builder helpers
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function textLines(cx, cy, lines, opts = {}) {
  const fontSize = opts.fontSize || 15;
  const lineHeight = opts.lineHeight || fontSize * 1.28;
  const fill = opts.fill || "#0f172a";
  const weight = opts.weight || "700";
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;
  return lines
    .map(
      (line, idx) =>
        `<text x="${cx}" y="${(startY + idx * lineHeight).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`,
    )
    .join("\n");
}

function drawTerminator(cx, cy, w, h, lines, theme = "emerald") {
  const palette = {
    emerald: { fill: "#ecfdf5", stroke: "#059669", text: "#064e3b" },
    white: { fill: "#ffffff", stroke: "#334155", text: "#0f172a" },
    rose: { fill: "#fff1f2", stroke: "#e11d48", text: "#881337" },
  }[theme];
  const x = cx - w / 2;
  const y = cy - h / 2;
  const rx = h / 2;
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="2.5" filter="url(#drop-shadow)"/>
      ${textLines(cx, cy, lines, { fontSize: 15.5, weight: "800", fill: palette.text })}
    </g>
  `;
}

function drawBox(cx, cy, w, h, lines, theme = "white", subline = null) {
  const palette = {
    white: {
      fill: "#ffffff",
      stroke: "#334155",
      text: "#0f172a",
      sub: "#64748b",
    },
    green: {
      fill: "#dcfce7",
      stroke: "#16a34a",
      text: "#14532d",
      sub: "#166534",
    },
    red: {
      fill: "#fee2e2",
      stroke: "#e11d48",
      text: "#9f1239",
      sub: "#be123c",
    },
    amber: {
      fill: "#fef3c7",
      stroke: "#d97706",
      text: "#78350f",
      sub: "#92400e",
    },
    blue: {
      fill: "#eff6ff",
      stroke: "#2563eb",
      text: "#1e3a8a",
      sub: "#1d4ed8",
    },
  }[theme];
  const x = cx - w / 2;
  const y = cy - h / 2;
  const mainY = subline ? cy - 8 : cy;
  const subSvg = subline
    ? `<text x="${cx}" y="${cy + 13}" text-anchor="middle" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="${palette.sub}">${esc(subline)}</text>`
    : "";
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="2.2" filter="url(#drop-shadow)"/>
      ${textLines(cx, mainY, lines, { fontSize: 14.5, weight: "700", fill: palette.text })}
      ${subSvg}
    </g>
  `;
}

function drawIO(cx, cy, w, h, lines, theme = "blue", subline = null) {
  const palette = {
    blue: {
      fill: "#eff6ff",
      stroke: "#2563eb",
      text: "#1e3a8a",
      sub: "#1d4ed8",
    },
    white: {
      fill: "#ffffff",
      stroke: "#334155",
      text: "#0f172a",
      sub: "#64748b",
    },
  }[theme];
  const skew = 16;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  const pts = `${x0 + skew},${y0} ${x1},${y0} ${x1 - skew},${y1} ${x0},${y1}`;
  const mainY = subline ? cy - 8 : cy;
  const subSvg = subline
    ? `<text x="${cx}" y="${cy + 13}" text-anchor="middle" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="${palette.sub}">${esc(subline)}</text>`
    : "";
  return `
    <g>
      <polygon points="${pts}" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="2.2" stroke-linejoin="round" filter="url(#drop-shadow)"/>
      ${textLines(cx, mainY, lines, { fontSize: 14.5, weight: "700", fill: palette.text })}
      ${subSvg}
    </g>
  `;
}

function drawDecision(cx, cy, hw, hh, lines) {
  const pts = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return `
    <g>
      <polygon points="${pts}" fill="#fffbeb" stroke="#b45309" stroke-width="2.4" stroke-linejoin="round" filter="url(#drop-shadow)"/>
      ${textLines(cx, cy, lines, { fontSize: 14, weight: "800", fill: "#78350f", lineHeight: 16.5 })}
    </g>
  `;
}

function drawArrow(points, opts = {}) {
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");
  const stroke = opts.stroke || "#334155";
  const marker = opts.noArrow ? "" : 'marker-end="url(#arrow-head)"';
  let labelSvg = "";
  if (opts.label) {
    const lx = opts.lx;
    const ly = opts.ly;
    const pw = opts.label.length * 7.8 + 16;
    const ph = 22;
    const labelColor = opts.labelColor || "#0f172a";
    const labelBg = opts.labelBg || "#ffffff";
    const labelBorder = opts.labelBorder || "#94a3b8";
    labelSvg = `
      <rect x="${lx - pw / 2}" y="${ly - ph / 2}" width="${pw}" height="${ph}" rx="5" fill="${labelBg}" stroke="${labelBorder}" stroke-width="1.3"/>
      <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-family="'Plus Jakarta Sans', 'Inter', sans-serif" font-size="12" font-weight="800" fill="${labelColor}">${esc(opts.label)}</text>
    `;
  }

  return `
    <path d="${d}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" ${marker}/>
    ${labelSvg}
  `;
}

function buildCompleteSimpleFlowSvg() {
  const parts = [];

  // Canvas: 1920 x 1220
  parts.push(`
    <rect x="0" y="0" width="1920" height="1220" fill="#ffffff"/>

    <!-- Top Banner -->
    <rect x="24" y="20" width="1872" height="68" rx="12" fill="#0f172a"/>
    <text x="52" y="54" dominant-baseline="central" font-family="'Plus Jakarta Sans', 'Inter', sans-serif" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="-0.4">KM100 INVENTORY SYSTEM — USER FLOW</text>
    <text x="645" y="54" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="17" font-weight="500" fill="#cbd5e1">Login &amp; Registration  →  Simple Everyday System Usage</text>
    <rect x="1676" y="38" width="196" height="32" rx="16" fill="#1e293b"/>
    <text x="1774" y="54" text-anchor="middle" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#38bdf8" letter-spacing="0.4">USER FLOW GUIDE</text>

    <!-- PART 1 Container (Left: x=24..940, y=104..1130) -->
    <rect x="24" y="104" width="916" height="1026" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.8"/>
    <rect x="24" y="104" width="916" height="44" rx="14" fill="#1e293b"/>
    <rect x="24" y="130" width="916" height="18" fill="#1e293b"/>
    <text x="482" y="126" text-anchor="middle" dominant-baseline="central" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="0.8">PART 1: ENTRY, LOGIN &amp; ONBOARDING</text>

    <!-- PART 2 Container (Right: x=980..1896, y=104..1130) -->
    <rect x="980" y="104" width="916" height="1026" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.8"/>
    <rect x="980" y="104" width="916" height="44" rx="14" fill="#1e293b"/>
    <rect x="980" y="130" width="916" height="18" fill="#1e293b"/>
    <text x="1438" y="126" text-anchor="middle" dominant-baseline="central" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="800" fill="#ffffff" letter-spacing="0.8">PART 2: HOW TO USE THE SYSTEM (SIMPLE)</text>
  `);

  // =========================================================================
  // PART 1: EXACT USER FLOW (Login, Registration & Onboarding)
  // Center cx = 448 (wide space on left & right for non-overlapping errors)
  // =========================================================================
  parts.push(
    drawTerminator(448, 190, 240, 44, ["Launches Website / App"], "white"),
  );
  parts.push(drawDecision(448, 266, 96, 36, ["Existing", "Session?"]));
  parts.push(drawBox(448, 356, 224, 44, ["Authentication Screen"], "white"));
  parts.push(drawDecision(448, 444, 86, 36, ["User", "Action?"]));

  // Left: Sign In (cx = 304) + Show Error Banner (cx = 114, same row as Verify Credentials)
  parts.push(
    drawBox(304, 536, 206, 46, ["Enter Email and", "Password"], "white"),
  );
  parts.push(drawDecision(304, 628, 84, 36, ["Verify", "Credentials?"]));
  parts.push(drawBox(114, 628, 152, 44, ["Show Error", "Banner"], "red"));
  parts.push(drawBox(304, 728, 186, 42, ["Set Active Session"], "white"));

  // Right: Register (cx = 592) + Show Passkey Error (cx = 808, same row as Valid Shared Passkey)
  parts.push(
    drawBox(592, 536, 212, 46, ["Enter Info and", "Shared Passkey"], "white"),
  );
  parts.push(drawDecision(592, 628, 94, 38, ["Valid Shared", "Passkey?"]));
  parts.push(drawBox(808, 628, 160, 44, ["Show Passkey", "Error"], "red"));
  parts.push(drawDecision(592, 728, 82, 34, ["Select", "Role?"]));

  // Roles -> Tour -> Dashboard
  parts.push(drawBox(486, 814, 178, 44, ["Create Admin", "Account"], "green"));
  parts.push(drawBox(698, 814, 178, 44, ["Create Staff", "Account"], "green"));
  parts.push(drawBox(592, 886, 210, 42, ["8-Step Interactive Tour"], "amber"));
  parts.push(drawBox(592, 950, 210, 40, ["Complete or Skip Tour"], "white"));
  parts.push(drawBox(592, 1012, 184, 40, ["Save Tour Flag"], "white"));

  // Dashboard (Bottom center of Part 1)
  parts.push(
    drawBox(448, 1086, 290, 48, ["Master Facilities Dashboard"], "green"),
  );

  // PART 1 ARROWS
  parts.push(
    drawArrow([
      [448, 212],
      [448, 230],
    ]),
  );
  // Existing Session? -> No -> Auth Screen
  parts.push(
    drawArrow(
      [
        [448, 302],
        [448, 334],
      ],
      {
        label: "NO",
        lx: 448,
        ly: 317,
        labelColor: "#9f1239",
        labelBorder: "#fecdd3",
        labelBg: "#fff1f2",
      },
    ),
  );
  // Existing Session? -> Yes -> Far Right Rail x=914 down to Master Facilities Dashboard
  parts.push(
    drawArrow(
      [
        [544, 266],
        [914, 266],
        [914, 1086],
        [593, 1086],
      ],
      {
        label: "YES",
        lx: 730,
        ly: 266,
        labelColor: "#065f46",
        labelBorder: "#a7f3d0",
        labelBg: "#ecfdf5",
      },
    ),
  );

  // Auth -> User Action
  parts.push(
    drawArrow([
      [448, 378],
      [448, 408],
    ]),
  );

  // Sign In branch
  parts.push(
    drawArrow(
      [
        [362, 444],
        [304, 444],
        [304, 513],
      ],
      {
        label: "Sign In",
        lx: 304,
        ly: 478,
        labelColor: "#1e3a8a",
        labelBorder: "#bfdbfe",
        labelBg: "#eff6ff",
      },
    ),
  );
  parts.push(
    drawArrow([
      [304, 559],
      [304, 592],
    ]),
  );
  // Verify Credentials -> Invalid -> Show Error Banner -> straight UP x=114 to Authentication Screen
  parts.push(
    drawArrow(
      [
        [220, 628],
        [190, 628],
      ],
      {
        label: "Invalid",
        lx: 205,
        ly: 604,
        labelColor: "#9f1239",
        labelBorder: "#fecdd3",
        labelBg: "#fff1f2",
      },
    ),
  );
  parts.push(
    drawArrow([
      [114, 606],
      [114, 356],
      [336, 356],
    ]),
  );
  // Verify Credentials -> Valid -> Set Active Session -> straight down to Master Facilities Dashboard
  parts.push(
    drawArrow(
      [
        [304, 664],
        [304, 707],
      ],
      {
        label: "Valid",
        lx: 304,
        ly: 684,
        labelColor: "#065f46",
        labelBorder: "#a7f3d0",
        labelBg: "#ecfdf5",
      },
    ),
  );
  parts.push(
    drawArrow([
      [304, 749],
      [304, 1062],
    ]),
  );

  // Register branch
  parts.push(
    drawArrow(
      [
        [534, 444],
        [592, 444],
        [592, 513],
      ],
      {
        label: "Register",
        lx: 592,
        ly: 478,
        labelColor: "#1e3a8a",
        labelBorder: "#bfdbfe",
        labelBg: "#eff6ff",
      },
    ),
  );
  parts.push(
    drawArrow([
      [592, 559],
      [592, 590],
    ]),
  );
  // Valid Shared Passkey -> Invalid -> Show Passkey Error -> straight UP x=808 to Enter Info and Shared Passkey
  parts.push(
    drawArrow(
      [
        [686, 628],
        [728, 628],
      ],
      {
        label: "Invalid",
        lx: 707,
        ly: 604,
        labelColor: "#9f1239",
        labelBorder: "#fecdd3",
        labelBg: "#fff1f2",
      },
    ),
  );
  parts.push(
    drawArrow([
      [808, 606],
      [808, 536],
      [698, 536],
    ]),
  );
  // Valid Shared Passkey -> Valid -> Select Role
  parts.push(
    drawArrow(
      [
        [592, 666],
        [592, 694],
      ],
      {
        label: "Valid",
        lx: 592,
        ly: 680,
        labelColor: "#065f46",
        labelBorder: "#a7f3d0",
        labelBg: "#ecfdf5",
      },
    ),
  );

  // Select Role -> Custodian / Staff
  parts.push(
    drawArrow(
      [
        [510, 728],
        [486, 728],
        [486, 792],
      ],
      {
        label: "Custodian",
        lx: 486,
        ly: 758,
        labelColor: "#b45309",
        labelBorder: "#fde68a",
        labelBg: "#fffbeb",
      },
    ),
  );
  parts.push(
    drawArrow(
      [
        [674, 728],
        [698, 728],
        [698, 792],
      ],
      {
        label: "Staff",
        lx: 698,
        ly: 758,
        labelColor: "#065f46",
        labelBorder: "#a7f3d0",
        labelBg: "#ecfdf5",
      },
    ),
  );

  // Merge Roles -> Tour -> Skip -> Save Flag -> Dashboard
  parts.push(
    drawArrow([
      [486, 836],
      [486, 854],
      [592, 854],
      [592, 865],
    ]),
  );
  parts.push(
    drawArrow(
      [
        [698, 836],
        [698, 854],
        [592, 854],
      ],
      { noArrow: true },
    ),
  );
  parts.push(
    drawArrow([
      [592, 907],
      [592, 930],
    ]),
  );
  parts.push(
    drawArrow([
      [592, 970],
      [592, 992],
    ]),
  );
  parts.push(
    drawArrow([
      [592, 1032],
      [592, 1048],
      [448, 1048],
      [448, 1062],
    ]),
  );

  // =========================================================================
  // CONNECTION PART 1 -> PART 2 (Clean gutter bus x=960)
  // =========================================================================
  parts.push(
    drawArrow(
      [
        [448, 1110],
        [448, 1144],
        [960, 1144],
        [960, 200],
        [1228, 200],
      ],
      { stroke: "#059669" },
    ),
  );

  // =========================================================================
  // PART 2: HOW TO USE THE SYSTEM (SIMPLE GUIDE) (cx = 1438)
  // =========================================================================
  parts.push(
    drawBox(
      1438,
      200,
      420,
      54,
      ["1. View Dashboard & Totals"],
      "white",
      "Check total items, rooms & condition alerts",
    ),
  );
  parts.push(
    drawBox(
      1438,
      292,
      420,
      54,
      ["2. Select Training Room or All Facilities"],
      "white",
      "Choose a room from the sidebar menu",
    ),
  );
  parts.push(
    drawIO(
      1438,
      384,
      420,
      54,
      ["3. Search or Filter Equipment"],
      "blue",
      "Find items by name, code, or condition",
    ),
  );

  parts.push(drawDecision(1438, 480, 134, 42, ["What Do You", "Need to Do?"]));

  // Left & Right simple actions
  parts.push(
    drawBox(
      1224,
      586,
      324,
      60,
      ["Update Quantity or Condition"],
      "white",
      "Click + / - buttons or change status badge",
    ),
  );
  parts.push(
    drawBox(
      1652,
      586,
      324,
      60,
      ["Add or Edit Equipment"],
      "white",
      "Click + Add Item or Edit existing details",
    ),
  );

  // Auto saved
  parts.push(
    drawBox(1438, 686, 340, 46, ["Changes Saved Automatically"], "green"),
  );

  // Admin Check
  parts.push(
    drawDecision(1438, 780, 132, 40, ["Are You Admin", "(Custodian)?"]),
  );
  parts.push(
    drawBox(
      1692,
      856,
      300,
      56,
      ["Manage Rooms & Passkeys"],
      "amber",
      "Add rooms, delete items, update passkeys",
    ),
  );

  // Reports
  parts.push(
    drawIO(
      1438,
      954,
      456,
      58,
      ["Print Custody Sheet or Export Excel"],
      "blue",
      "Generate 3-signature sheets & multi-sheet workbooks",
    ),
  );

  // Done Check & Sign Out
  parts.push(drawDecision(1438, 1054, 112, 38, ["Done for", "Today?"]));
  parts.push(
    drawTerminator(1736, 1054, 210, 48, ["Sign Out (End)"], "emerald"),
  );

  // PART 2 ARROWS
  parts.push(
    drawArrow([
      [1438, 227],
      [1438, 265],
    ]),
  );
  parts.push(
    drawArrow([
      [1438, 319],
      [1438, 357],
    ]),
  );
  parts.push(
    drawArrow([
      [1438, 411],
      [1438, 438],
    ]),
  );

  // What do you need to do -> 2 branches
  parts.push(
    drawArrow(
      [
        [1304, 480],
        [1224, 480],
        [1224, 556],
      ],
      {
        label: "Daily Audit",
        lx: 1224,
        ly: 518,
        labelColor: "#1e3a8a",
        labelBorder: "#bfdbfe",
        labelBg: "#eff6ff",
      },
    ),
  );
  parts.push(
    drawArrow(
      [
        [1572, 480],
        [1652, 480],
        [1652, 556],
      ],
      {
        label: "Manage Items",
        lx: 1652,
        ly: 518,
        labelColor: "#1e3a8a",
        labelBorder: "#bfdbfe",
        labelBg: "#eff6ff",
      },
    ),
  );

  // Merge -> Changes Saved Automatically
  parts.push(
    drawArrow([
      [1224, 616],
      [1224, 642],
      [1438, 642],
      [1438, 663],
    ]),
  );
  parts.push(
    drawArrow(
      [
        [1652, 616],
        [1652, 642],
        [1438, 642],
      ],
      { noArrow: true },
    ),
  );

  // Saved -> Admin Check
  parts.push(
    drawArrow([
      [1438, 709],
      [1438, 740],
    ]),
  );

  // Admin Check -> Yes (Admin) -> Manage Rooms -> Reports
  parts.push(
    drawArrow(
      [
        [1570, 780],
        [1692, 780],
        [1692, 828],
      ],
      {
        label: "YES",
        lx: 1692,
        ly: 800,
        labelColor: "#b45309",
        labelBorder: "#fde68a",
        labelBg: "#fffbeb",
      },
    ),
  );
  parts.push(
    drawArrow([
      [1692, 884],
      [1692, 904],
      [1438, 904],
      [1438, 925],
    ]),
  );

  // Admin Check -> No (Staff) -> left lane x=1182 down to Reports
  parts.push(
    drawArrow(
      [
        [1306, 780],
        [1182, 780],
        [1182, 904],
        [1438, 904],
        [1438, 925],
      ],
      {
        label: "NO (Staff)",
        lx: 1236,
        ly: 780,
        labelColor: "#065f46",
        labelBorder: "#a7f3d0",
        labelBg: "#ecfdf5",
      },
    ),
  );

  // Reports -> Done for Today?
  parts.push(
    drawArrow([
      [1438, 983],
      [1438, 1016],
    ]),
  );

  // Done for Today? -> No -> loop back up x=1018 to Select Room (y=292)
  parts.push(
    drawArrow(
      [
        [1326, 1054],
        [1018, 1054],
        [1018, 292],
        [1228, 292],
      ],
      {
        label: "NO (Keep Working)",
        lx: 1170,
        ly: 1054,
        labelColor: "#1e3a8a",
        labelBorder: "#bfdbfe",
        labelBg: "#eff6ff",
      },
    ),
  );

  // Done for Today? -> Yes -> Sign Out
  parts.push(
    drawArrow(
      [
        [1550, 1054],
        [1631, 1054],
      ],
      {
        label: "YES",
        lx: 1588,
        ly: 1054,
        labelColor: "#065f46",
        labelBorder: "#a7f3d0",
        labelBg: "#ecfdf5",
      },
    ),
  );

  // =========================================================================
  // BOTTOM LEGEND STRIP (y=1154..1204)
  // =========================================================================
  parts.push(`
    <g>
      <rect x="24" y="1154" width="1872" height="50" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="54" y="1179" dominant-baseline="central" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" fill="#0f172a">LEGEND:</text>

      <rect x="160" y="1166" width="44" height="26" rx="13" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
      <text x="214" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">Start / Sign Out</text>

      <rect x="375" y="1166" width="44" height="26" rx="6" fill="#ffffff" stroke="#334155" stroke-width="2"/>
      <text x="429" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">User Action</text>

      <polygon points="575,1166 597,1179 575,1192 553,1179" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>
      <text x="607" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">Decision / Choice</text>

      <rect x="780" y="1166" width="44" height="26" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      <text x="834" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">Account Created / Saved</text>

      <rect x="1040" y="1166" width="44" height="26" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="1094" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">Tour / Admin Tools</text>

      <rect x="1275" y="1166" width="44" height="26" rx="6" fill="#fee2e2" stroke="#e11d48" stroke-width="2"/>
      <text x="1329" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">Error Message</text>

      <polygon points="1485,1166 1525,1166 1517,1192 1477,1192" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="1535" y="1179" dominant-baseline="central" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700" fill="#334155">Search &amp; Export Reports</text>
    </g>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1220" width="1920" height="1220">
  <defs>
    <filter id="drop-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.06"/>
    </filter>
    <marker id="arrow-head" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#334155"/>
    </marker>
  </defs>
  ${parts.join("\n")}
</svg>`;
}

function renderHighDpiPng(svgContent, pngOutPath) {
  const chromePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const browser = chromePaths.find((p) => fs.existsSync(p));
  if (!browser) {
    throw new Error(
      "Neither Chrome nor Edge found for high-DPI PNG rendering.",
    );
  }

  const tmpHtml = path.join(outDir, "_render_tmp.html");
  const tmpProfile = path.join(outDir, "_chrome_tmp");
  fs.writeFileSync(
    tmpHtml,
    `<!doctype html><html><head><style>*{margin:0;padding:0}body{background:#fff;width:1920px;height:1220px;overflow:hidden}</style></head><body>${svgContent}</body></html>`,
    "utf8",
  );

  try {
    execFileSync(
      browser,
      [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        `--user-data-dir=${tmpProfile}`,
        "--force-device-scale-factor=2",
        "--window-size=1920,1220",
        `--screenshot=${pngOutPath}`,
        `file:///${tmpHtml.replace(/\\/g, "/")}`,
      ],
      { stdio: "pipe" },
    );
  } finally {
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
    if (fs.existsSync(tmpProfile))
      fs.rmSync(tmpProfile, { recursive: true, force: true });
  }
}

function run() {
  const svg = buildCompleteSimpleFlowSvg();
  const svgPath = path.join(outDir, "user-flow-flowchart.svg");
  const pngPath = path.join(outDir, "user-flow-flowchart.png");

  fs.writeFileSync(svgPath, svg, "utf8");
  console.log(`Saved ${svgPath} (${svg.length} bytes)`);

  renderHighDpiPng(svg, pngPath);
  const pngStats = fs.statSync(pngPath);
  console.log(`Saved ${pngPath} (${pngStats.size} bytes @ 3840x2440 Ultra-HD)`);

  // Copy to brain artifacts
  const brainDir =
    "C:\\Users\\Kaizer\\.gemini\\antigravity\\brain\\f050b8ed-2828-4b28-9ad7-67c2072b4a8f";
  if (fs.existsSync(brainDir)) {
    fs.copyFileSync(pngPath, path.join(brainDir, "user-flow-flowchart.png"));
    fs.copyFileSync(svgPath, path.join(brainDir, "user-flow-flowchart.svg"));
  }

  // Update docs/APP_FLOWCHART.md
  const mmdContent = fs.readFileSync(mmdPath, "utf8");
  const mdContent = `# KM100 Inventory Management System: User Flow Flowchart

This document contains the complete, easy-to-read **User Flow Flowchart** for the **KM100 Skills and Training Center, Inc.** Property Custody & Inventory Management System.

- **Part 1 (Entry, Login & Onboarding)**: Matches the full authentication flow from launching the app, signing in or registering with a shared passkey (Custodian or Staff), taking the 8-step interactive tour, and landing on the **Master Facilities Dashboard**.
- **Part 2 (How to Use the System — Simple)**: Continues cleanly from the dashboard into simple daily operations: picking a room, searching/filtering equipment, adjusting stock quantities or condition badges, managing rooms/passkeys (Admin only), printing custody sheets / exporting Excel / printing QR stickers, and signing out.

---

## User Flow Flowchart

![KM100 User Flow Flowchart](./flowcharts/user-flow-flowchart.png)

> **Exports**: [Ultra-HD PNG (3840×2440)](./flowcharts/user-flow-flowchart.png) • [Lossless Vector SVG](./flowcharts/user-flow-flowchart.svg) • [Mermaid Source (\`ims-user-flow.mmd\`)](./ims-user-flow.mmd)

---

### Mermaid Source Definition (\`docs/ims-user-flow.mmd\`)

\`\`\`mermaid
${mmdContent.trim()}
\`\`\`
`;

  fs.writeFileSync(path.join(docsDir, "APP_FLOWCHART.md"), mdContent, "utf8");
  console.log("Updated docs/APP_FLOWCHART.md");

  // Update docs/KM100_Inventory_Flowcharts_Bondpaper.html
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KM100 Inventory System - User Flow Flowchart</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #0f172a;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      line-height: 1.4;
      padding: 24px 16px;
    }

    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      max-width: 12.5in;
      margin: 0 auto 20px auto;
      background: #1e293b;
      padding: 14px 24px;
      border-radius: 10px;
      border: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toolbar-info h2 {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }

    .toolbar-info p {
      font-size: 13px;
      color: #94a3b8;
    }

    .print-btn {
      background: #b45309;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s ease;
    }

    .print-btn:hover {
      background: #92400e;
    }

    .slide-page {
      max-width: 12.5in;
      margin: 0 auto;
      background: #ffffff;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
    }

    .slide-page svg {
      width: 100%;
      height: auto;
      display: block;
    }

    @media print {
      @page {
        size: letter landscape;
        margin: 0;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .screen-toolbar {
        display: none !important;
      }
      .slide-page {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0.25in !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    }
  </style>
</head>
<body>

  <div class="screen-toolbar">
    <div class="toolbar-info">
      <h2>KM100 Skills &amp; Training Center, Inc.</h2>
      <p>Complete User Flow Flowchart — Login, Onboarding &amp; Simple System Guide</p>
    </div>
    <button class="print-btn" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print to Landscape / Save PDF
    </button>
  </div>

  <section class="slide-page">
    ${svg}
  </section>

</body>
</html>
`;

  fs.writeFileSync(
    path.join(docsDir, "KM100_Inventory_Flowcharts_Bondpaper.html"),
    htmlContent,
    "utf8",
  );
  console.log("Updated docs/KM100_Inventory_Flowcharts_Bondpaper.html");

  console.log("Done! Generated complete User Flow Flowchart.");
}

run();
