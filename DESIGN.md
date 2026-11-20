# KM100 Inventory System — Design & Typography Standards

## 1. Approved Typography Pairing

| Role | Font Family | Weights Used | Fallback | Purpose |
|------|-------------|--------------|----------|---------|
| **Headings & Display** | **Plus Jakarta Sans** | `600` (SemiBold), `700` (Bold), `800` (ExtraBold) | `system-ui, sans-serif` | App bar branding, modal headers, section titles, card headers |
| **Body & UI Controls** | **DM Sans** | `400` (Regular), `500` (Medium), `600` (SemiBold) | `system-ui, sans-serif` | Table cells, form inputs, button labels, dropdown menus, microcopy |
| **Data & Tabular Figures** | **JetBrains Mono** | `400` (Regular), `500` (Medium), `700` (Bold) | `Consolas, monospace` | Stock counts, property IDs, unit measures, timestamps, ratios |

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
```

---

## 2. Fixed App Type Scale (8pt Baseline Rhythm)

| Token / Class | Size | Line Height | Tracking | Weight & Font | Primary Use Case |
|---------------|------|-------------|----------|---------------|------------------|
| `text-2xl font-black font-mono` | 24px (`1.5rem`) | 32px | `-0.02em` | ExtraBold / JetBrains Mono | Dashboard KPI values (`tabular-nums`) |
| `text-xl font-bold` | 20px (`1.25rem`) | 28px | `-0.025em` | Bold / Plus Jakarta Sans | Section titles (e.g. Institutional Overview) |
| `text-base font-bold` | 16px (`1rem`) | 24px | `-0.015em` | Bold / Plus Jakarta Sans | Modal titles, main system headers, card titles |
| `text-sm font-semibold` | 14px (`0.875rem`) | 20px | Normal | SemiBold / Plus Jakarta Sans | Dialog subheadings, primary button labels |
| `text-xs font-medium` | 12px (`0.75rem`) | 16px | Normal | Medium / DM Sans | Table cell body data, inputs, secondary buttons |
| `text-[11px] font-bold uppercase` | 11px (`0.6875rem`) | 16px | `+0.05em` | Bold / DM Sans | Table column headers (`th`), badge categories |
| `text-[10px] font-mono` | 10px (`0.625rem`) | 14px | Normal | Medium / JetBrains Mono | Count pill indicators, format indicators (`.xlsx`) |

---

## 3. Weight Contrast Principles

1. **Heading/Body Distinction**: Headings must establish immediate visual hierarchy with weight `700` (`font-bold`) or `800` (`font-black`) in *Plus Jakarta Sans*, while adjacent explanatory text rests on `400` (`font-normal`) or `500` (`font-medium`) in *DM Sans*.
2. **Numeric Data Scannability**: Inventory quantities, operational percentages, and item counts strictly use `font-mono tabular-nums font-bold` to prevent character shifting during count changes and enable swift vertical scanning.
3. **No Slop Fallbacks**: Generic fallbacks (*Inter*, *Roboto*, *Arial*, *Space Grotesk*) have been eliminated from all Tailwind tokens and base layers.
