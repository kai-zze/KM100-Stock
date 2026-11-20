# KM100 Inventory Management System - Full Codebase Prompt Bundle
> **Organization:** KM100 Skills and Training Center, Inc.
> **Architecture:** React 18, TypeScript, Tailwind CSS, Lucide React, ExcelJS, Supabase Cloud Database
> **Design Standards:** UI/UX Pro Max & Impeccable Craftsmanship
> **Status:** Complete modular codebase ready for online AI prompting (ChatGPT, Claude, Gemini, v0, Lovable)

---

## 1. System Prompt & Guidelines for Online AI
You are an expert full-stack engineer and UI/UX craftsman working on the KM100 Inventory Management System.
Follow these strict requirements:
1. **Institutional Palette**: Primary Charcoal (#1c1917), Deep Amber (#b45309), Warm Gold (#d97706), Cream (#fdfcf9), Architectural Border (#e7d8c5).
2. **Typography**: Headings use 'Plus Jakarta Sans' (weights 600-800), body uses 'DM Sans' (weights 400-600), tabular figures and codes use 'JetBrains Mono'. Never use Inter, Roboto, Arial, or system default fallbacks.
3. **Persistence & Resilience**: Auto-save to localStorage with keys km100_inventory_rooms_v1, km100_inventory_items_v1, km100_inventory_columns_v1. Support multi-sheet Excel export/import and Supabase cloud sync.
4. **Zero AI Slop**: High density direct manipulation (inline +/- buttons, bulk selection, sticky table headers, smooth transitions).

---

## 2. Source Files

### File: package.json
```json
{
  "name": "km100-inventory-management",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.6"
  }
}

```

---

### File: vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});

```

---

### File: tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf7',
          100: '#faedd7',
          200: '#f5d9ad',
          300: '#edbf7d',
          400: '#e5a550',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          deep: '#1e1b18',
          card: '#2a2621'
        },
        km: {
          charcoal: '#1c1917',
          amber: '#b45309',
          gold: '#d97706',
          cream: '#fdfcf9',
          warmgray: '#f5efe6',
          border: '#e7d8c5'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}

```

---

### File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": false,
    "baseUrl": ".",
    "paths": {
      "react": ["src/types/ambient.d.ts"],
      "react-dom": ["src/types/ambient.d.ts"],
      "react-dom/*": ["src/types/ambient.d.ts"],
      "react/jsx-runtime": ["src/types/ambient.d.ts"],
      "react/jsx-dev-runtime": ["src/types/ambient.d.ts"],
      "lucide-react": ["src/types/ambient.d.ts"],
      "xlsx": ["src/types/ambient.d.ts"],
      "@supabase/supabase-js": ["src/types/ambient.d.ts"],
      "*": ["src/types/*", "*"]
    }
  },
  "include": ["src/**/*"]
}

```

---

### File: DESIGN.md
```markdown
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


---

## 4. Institutional Color System (Extracted from KM100 Identity)

The system palette directly embodies the authentic institutional identity of **KM100 Skills and Training Center, Inc.**:

| Token Name | Hex Code | Swatch & Role |
|------------|----------|---------------|
| **Institutional Charcoal** | #1c1917 / #211e19 | Deep header bar, floating action HUD, high-contrast badges |
| **KM100 Primary Amber** | #b45309 / #d97706 | Brand hero color, primary action buttons, active navigation indicator |
| **Warm Gold Accent** | #f59e0b / #edbf7d | Icons, notification indicators, KPI highlights |
| **Warm Canvas Cream** | #fdfbf7 / #fdfcf9 | Primary page background, container surface |
| **Warm Card Surface** | #ffffff / #fbf8f2 | Table card containers, dialog modals |
| **Architectural Border** | #e7d8c5 / #e2e8f0 | Dividers, table row borders, card outlines |

### Semantic Status Mappings
- **Working / Good**: Emerald Green (#059669 / #10b981)
- **Used / Caution**: Amber Gold (#d97706 / #b45309)
- **Defective / Condemned**: Crimson Rose (#e11d48 / #be123c)
- **Empty / Incomplete**: Warm Slate / Institutional Neutral (#64748b / #78716c)
```

---

### File: GEMINI.md
```markdown
# Agent Guidelines: KM100 Inventory System Design & Engineering Standards

This project adheres to the **UI/UX Pro Max** and **Impeccable** craftsmanship standards.

## Mandatory Design Principles
1. **No AI Slop**: Avoid generic purple gradient hero sections, unstyled borders, and washed-out gray badges.
2. **Operate Mode Excellence**: Ensure high density, swift direct manipulation (inline +/- buttons), sticky table headers, and smooth keyboard/accessibility support.
3. **Institutional Polish**: Maintain clear institutional branding for "KM100 Skills and Training Center, Inc.", with refined badge colors, crisp typography, and responsive ergonomics.
4. **Resilience**: Auto-save all state changes to `localStorage`, provide full SheetJS multi-sheet Excel exports, and maintain JSON backup/restore capabilities.

```

---

### File: README.md
```markdown
# KM100 Inventory Management System
> **Official Asset & Property Register for KM100 Skills and Training Center, Inc.**

---

## 🗂️ Project Directory Structure

```
KM100 Stock/
├── 🌐 backend/                      # Cloud database definitions & configurations
│   ├── database/
│   │   └── schema.sql             # Complete PostgreSQL schema (tables, RLS, indexes)
│   └── README.md                  # Supabase connection & deployment instructions
│
├── 🎨 frontend (src/ & public/)/    # User interface & application logic
│   ├── public/                    # Portable offline vendor bundles & assets
│   │   ├── react.production.min.js
│   │   ├── react-dom.production.min.js
│   │   ├── exceljs.min.js
│   │   ├── xlsx.full.min.js
│   │   ├── tailwindcss.js
│   │   └── logo.png               # KM100 institutional seal
│   │
│   ├── src/                       # Modular TypeScript source code
│   │   ├── components/            # UI components (Header, Table, Modals, Badges)
│   │   │   ├── Header.tsx         # Institutional header & controls
│   │   │   ├── Sidebar.tsx        # Facility rooms navigation
│   │   │   ├── InventoryTable.tsx # High-density data grid with inline +/-
│   │   │   ├── ItemModal.tsx      # Add/edit inventory item modal
│   │   │   ├── RoomModal.tsx      # Add/edit facility room modal
│   │   │   ├── ConditionBadge.tsx # Status tags (Working, Repair, For Disposal)
│   │   │   ├── OverviewDashboard.tsx # Institution-wide summary cards
│   │   │   └── ColumnsSchemaModal.tsx# Custom column configuration
│   │   ├── types/                 # TypeScript data contracts & ambient types
│   │   ├── utils/                 # Excel export & Supabase client utilities
│   │   └── data/                  # Official institutional default datasets
│   │
│   └── index.html                 # Offline-first standalone web application
│
├── 📊 data/                         # Official spreadsheets and reference data
│   └── official-spreadsheets/
│       ├── KM100_Official_Inventory.xlsx # Master Excel file
│       └── KM100_Official_Inventory.csv  # Master CSV export
│
└── 📖 docs/                         # Project specifications & design architecture
    ├── DESIGN.md                  # UI/UX design standards & principles
    └── PRODUCT.md                 # Product requirements & feature roadmap
```

---

## 🚀 Getting Started

### 1. Instant Run (No Installation Required)
Simply double-click or open **`index.html`** in any web browser (Chrome, Edge, Firefox). The application loads offline using local scripts and connects automatically to the **Supabase PostgreSQL Cloud**.

### 2. Cloud Database Sync (Supabase)
The system is pre-configured with the **KM100-Stock** Supabase project:
- **Engine**: PostgreSQL 15+ Realtime
- **URL**: `https://kpzancwkmbhnuqbnqrii.supabase.co`
- Real-time multi-device sync is enabled across instructor tablets, classroom PCs, and admin workstations.

### 3. Excel Export & Import
- **Multi-Sheet Export**: Generates branded `.xlsx` workbooks partitioned by facility room with summary metrics.
- **Direct Import**: Drag & drop or upload any `.xlsx` or `.csv` spreadsheet to add directly to the database.

```

---

### File: src\main.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

```

---

### File: src\index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100;
  }
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.8);
}
.dark ::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.6);
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.9);
}

/* Modal and Toast Animations */
@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.96) translateY(4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-modal {
  animation: modalFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes toastSlideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-toast {
  animation: toastSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

```

---

### File: src\types\inventory.ts
```typescript
export type ColumnType = 'text' | 'number' | 'dropdown';

export interface ColumnDefinition {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[];
  required?: boolean;
  isSystem?: boolean;
  order: number;
}

export type ItemStatus = 'Working' | 'Empty' | 'Defective' | 'Deffective' | 'Used' | 'Incomplete' | string;
export type ItemCondition = ItemStatus;

export interface InventoryItem {
  id: string;
  roomId: string;
  name: string;
  category: string;
  quantity: number;
  units?: string;
  status?: ItemStatus;
  condition?: ItemCondition;
  room?: string;
  remarks?: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
}

export interface AppBackup {
  version: string;
  organization: string;
  exportedAt: string;
  rooms: Room[];
  columns: ColumnDefinition[];
  items: InventoryItem[];
}

```

---

### File: src\data\defaultData.ts
```typescript
import { ColumnDefinition, InventoryItem, Room } from '../types/inventory';

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'ITEM NAME', type: 'text', required: true, isSystem: true, order: 1 },
  {
    id: 'category',
    label: 'CATEGORY',
    type: 'dropdown',
    options: [
      'Tools',
      'Consumables and Maintenance',
      'Peripherals and Storage',
      'PC Hardware and Components',
      'Diagnostic and Testing',
      'Cables and Connectors',
      'Networking Equipment',
      'Operating System and Software'
    ],
    required: true,
    order: 2
  },
  { id: 'quantity', label: 'QUANTITY', type: 'number', required: true, isSystem: true, order: 3 },
  {
    id: 'units',
    label: 'UNITS',
    type: 'dropdown',
    options: ['pcs', 'case', 'box', 'bag', 'set', 'roll'],
    required: true,
    order: 4
  },
  {
    id: 'status',
    label: 'Status',
    type: 'dropdown',
    options: ['Working', 'Empty', 'Defective', 'Deffective', 'Used', 'Incomplete'],
    required: true,
    order: 5
  }
];

export const DEFAULT_ROOMS: Room[] = [
  { id: 'room-ccs', name: 'Contact Center Services', description: 'Contact Center Services Training Lab' },
  { id: 'room-admin', name: 'Admin Office', description: 'KM100 Administration & Operations Office' },
  { id: 'room-css', name: 'Computer System Servicing', description: 'Computer Systems Servicing NC II Lab' },
  { id: 'room-bp', name: 'Bread & Pastry', description: 'Bread and Pastry Production Training Facility' }
];

export const DEFAULT_ITEMS: InventoryItem[] = [    {
        "id":  "km100-001",
        "roomId":  "room-ccs",
        "name":  "100 in 1 Precision Screwdriver",
        "category":  "Tools",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-002",
        "roomId":  "room-ccs",
        "name":  "191ml WD-40",
        "category":  "Consumables and Maintenance",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-003",
        "roomId":  "room-ccs",
        "name":  "2.0 Flash Drive 16GB",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-004",
        "roomId":  "room-ccs",
        "name":  "2.5 HDD External Case",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-005",
        "roomId":  "room-ccs",
        "name":  "2.5 HDD External Case",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Empty",
        "condition":  "Empty",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-006",
        "roomId":  "room-ccs",
        "name":  "3 in 1 Printer with Wireless Access",
        "category":  "PC Hardware and Components",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Deffective",
        "condition":  "Deffective",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-007",
        "roomId":  "room-ccs",
        "name":  "3.0 Flash Drive 128GB",
        "category":  "Peripherals and Storage",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-008",
        "roomId":  "room-ccs",
        "name":  "32 in 1 Precision Screwdriver",
        "category":  "Tools",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-009",
        "roomId":  "room-ccs",
        "name":  "44 in 1 Precision Screwdriver",
        "category":  "Tools",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-010",
        "roomId":  "room-ccs",
        "name":  "7 in 1 Stainless Steel Cutter",
        "category":  "Tools",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-011",
        "roomId":  "room-ccs",
        "name":  "9V Battery",
        "category":  "Consumables and Maintenance",
        "quantity":  27,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-012",
        "roomId":  "room-ccs",
        "name":  "A4Tech HU-9 USB Headset",
        "category":  "Peripherals and Storage",
        "quantity":  14,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-013",
        "roomId":  "room-ccs",
        "name":  "ALHUA CCTV",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-014",
        "roomId":  "room-ccs",
        "name":  "Allen Wrench 8pcs",
        "category":  "Tools",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-015",
        "roomId":  "room-ccs",
        "name":  "Allen Wrench 9pcs",
        "category":  "Tools",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-016",
        "roomId":  "room-ccs",
        "name":  "Analog Multimeter Sanwa",
        "category":  "Diagnostic and Testing",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-017",
        "roomId":  "room-ccs",
        "name":  "Anti-static Wrist Strap",
        "category":  "Consumables and Maintenance",
        "quantity":  19,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-018",
        "roomId":  "room-ccs",
        "name":  "Bootable Drive",
        "category":  "Peripherals and Storage",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-019",
        "roomId":  "room-ccs",
        "name":  "Cat 6",
        "category":  "Cables and Connectors",
        "quantity":  26,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-020",
        "roomId":  "room-ccs",
        "name":  "CDR ",
        "category":  "PC Hardware and Components",
        "quantity":  27,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-021",
        "roomId":  "room-ccs",
        "name":  "CDR-W",
        "category":  "PC Hardware and Components",
        "quantity":  64,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-022",
        "roomId":  "room-ccs",
        "name":  "China Router",
        "category":  "Networking Equipment",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-023",
        "roomId":  "room-ccs",
        "name":  "Cisco Switch Catalyst 3750",
        "category":  "Networking Equipment",
        "quantity":  8,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-024",
        "roomId":  "room-ccs",
        "name":  "Cleaning Brush",
        "category":  "Consumables and Maintenance",
        "quantity":  24,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-025",
        "roomId":  "room-ccs",
        "name":  "Combination Pliers",
        "category":  "Tools",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-026",
        "roomId":  "room-ccs",
        "name":  "Cooling Pan",
        "category":  "PC Hardware and Components",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-027",
        "roomId":  "room-ccs",
        "name":  "Coupler",
        "category":  "Cables and Connectors",
        "quantity":  32,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-028",
        "roomId":  "room-ccs",
        "name":  "Crimping Tools Non-Pass through",
        "category":  "Tools",
        "quantity":  18,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-029",
        "roomId":  "room-ccs",
        "name":  "Crimping Tools Non-Pass through",
        "category":  "Tools",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-030",
        "roomId":  "room-ccs",
        "name":  "CSS Books",
        "category":  "Peripherals and Storage",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-031",
        "roomId":  "room-ccs",
        "name":  "Cutter",
        "category":  "Tools",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-032",
        "roomId":  "room-ccs",
        "name":  "Digital Multimeter",
        "category":  "Diagnostic and Testing",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-033",
        "roomId":  "room-ccs",
        "name":  "Digital Multimeter Standard",
        "category":  "Diagnostic and Testing",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-034",
        "roomId":  "room-ccs",
        "name":  "Dito Home",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-035",
        "roomId":  "room-ccs",
        "name":  "Double A Battery",
        "category":  "Consumables and Maintenance",
        "quantity":  18,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-036",
        "roomId":  "room-ccs",
        "name":  "Drill Bit x13",
        "category":  "Tools",
        "quantity":  2,
        "units":  "case",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-037",
        "roomId":  "room-ccs",
        "name":  "Dual Modular Box",
        "category":  "Cables and Connectors",
        "quantity":  7,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-038",
        "roomId":  "room-ccs",
        "name":  "DVDR 16X",
        "category":  "Consumables and Maintenance",
        "quantity":  73,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-039",
        "roomId":  "room-ccs",
        "name":  "Electrical Contact Cleaner",
        "category":  "Consumables and Maintenance",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-040",
        "roomId":  "room-ccs",
        "name":  "EPSON Printer L121",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-041",
        "roomId":  "room-ccs",
        "name":  "Ethernal Wall Plate",
        "category":  "Networking Equipment",
        "quantity":  12,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-042",
        "roomId":  "room-ccs",
        "name":  "Exernal Optical Drive",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-043",
        "roomId":  "room-ccs",
        "name":  "Filler Clead-free",
        "category":  "Consumables and Maintenance",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-044",
        "roomId":  "room-ccs",
        "name":  "Flat Head Screwdriver",
        "category":  "Tools",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-045",
        "roomId":  "room-ccs",
        "name":  "Globe at Home",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-046",
        "roomId":  "room-ccs",
        "name":  "Half used Contact Cleaner 450ml",
        "category":  "Consumables and Maintenance",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-047",
        "roomId":  "room-ccs",
        "name":  "HDD 500GB",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-048",
        "roomId":  "room-ccs",
        "name":  "HDMI to Display Port",
        "category":  "Cables and Connectors",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-049",
        "roomId":  "room-ccs",
        "name":  "Heatsink Compound",
        "category":  "Consumables and Maintenance",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-050",
        "roomId":  "room-ccs",
        "name":  "Helping Hand Magnifier LED light with Soldering Stand",
        "category":  "Tools",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-051",
        "roomId":  "room-ccs",
        "name":  "HP 800G1 Charger",
        "category":  "Cables and Connectors",
        "quantity":  7,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-052",
        "roomId":  "room-ccs",
        "name":  "HP EliteDesk 800 GI USDI - System Unit",
        "category":  "PC Hardware and Components",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Deffective",
        "condition":  "Deffective",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-053",
        "roomId":  "room-ccs",
        "name":  "INPLAY X10 Case",
        "category":  "PC Hardware and Components",
        "quantity":  4,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-054",
        "roomId":  "room-ccs",
        "name":  "INPLAY X50 Case",
        "category":  "PC Hardware and Components",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-055",
        "roomId":  "room-ccs",
        "name":  "JUHER SSD",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-056",
        "roomId":  "room-ccs",
        "name":  "K2 Web Cam",
        "category":  "Peripherals and Storage",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-057",
        "roomId":  "room-ccs",
        "name":  "Lan Tester",
        "category":  "Diagnostic and Testing",
        "quantity":  43,
        "units":  "pcs",
        "status":  "Deffective",
        "condition":  "Deffective",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-058",
        "roomId":  "room-ccs",
        "name":  "Long Nose Pliers",
        "category":  "Tools",
        "quantity":  19,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-059",
        "roomId":  "room-ccs",
        "name":  "Magnetic Mat",
        "category":  "Consumables and Maintenance",
        "quantity":  7,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-060",
        "roomId":  "room-ccs",
        "name":  "MERCUSYS Router",
        "category":  "Networking Equipment",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-061",
        "roomId":  "room-ccs",
        "name":  "Multi-function Induction Headlamp",
        "category":  "Tools",
        "quantity":  9,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-062",
        "roomId":  "room-ccs",
        "name":  "NAS USB",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-063",
        "roomId":  "room-ccs",
        "name":  "Network Attached Storage",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-064",
        "roomId":  "room-ccs",
        "name":  "Network Controller",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-065",
        "roomId":  "room-ccs",
        "name":  "NPC Monitor",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-066",
        "roomId":  "room-ccs",
        "name":  "NPC Monitor",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-067",
        "roomId":  "room-ccs",
        "name":  "PCI\u0026PCI Express Card",
        "category":  "PC Hardware and Components",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-068",
        "roomId":  "room-ccs",
        "name":  "Portable Electric Drill",
        "category":  "Tools",
        "quantity":  2,
        "units":  "box",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-069",
        "roomId":  "room-ccs",
        "name":  "Procurve Switch",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-070",
        "roomId":  "room-ccs",
        "name":  "Punch Down",
        "category":  "Tools",
        "quantity":  17,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-071",
        "roomId":  "room-ccs",
        "name":  "RAMSTA Motherboard",
        "category":  "PC Hardware and Components",
        "quantity":  5,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-072",
        "roomId":  "room-ccs",
        "name":  "Rework Station",
        "category":  "Tools",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-073",
        "roomId":  "room-ccs",
        "name":  "RJ45 Connector Cups Blue",
        "category":  "Cables and Connectors",
        "quantity":  176,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-074",
        "roomId":  "room-ccs",
        "name":  "RJ45 Network Connector",
        "category":  "Cables and Connectors",
        "quantity":  280,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-075",
        "roomId":  "room-ccs",
        "name":  "RJ45 Network Connector",
        "category":  "Cables and Connectors",
        "quantity":  397,
        "units":  "pcs",
        "status":  "Deffective",
        "condition":  "Deffective",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-076",
        "roomId":  "room-ccs",
        "name":  "RJ45 Network Connector Pass-through",
        "category":  "Cables and Connectors",
        "quantity":  46,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-077",
        "roomId":  "room-ccs",
        "name":  "SAMWA Multimeter",
        "category":  "Diagnostic and Testing",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-078",
        "roomId":  "room-ccs",
        "name":  "Screwdriver",
        "category":  "Tools",
        "quantity":  16,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-079",
        "roomId":  "room-ccs",
        "name":  "Screws",
        "category":  "Consumables and Maintenance",
        "quantity":  32,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-080",
        "roomId":  "room-ccs",
        "name":  "Single Modular Box",
        "category":  "Cables and Connectors",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-081",
        "roomId":  "room-ccs",
        "name":  "Solder Sucker",
        "category":  "Tools",
        "quantity":  15,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-082",
        "roomId":  "room-ccs",
        "name":  "Solder Wire",
        "category":  "Consumables and Maintenance",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-083",
        "roomId":  "room-ccs",
        "name":  "Soldering Kit",
        "category":  "Tools",
        "quantity":  11,
        "units":  "bag",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-084",
        "roomId":  "room-ccs",
        "name":  "Steel Tape",
        "category":  "Consumables and Maintenance",
        "quantity":  9,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-085",
        "roomId":  "room-ccs",
        "name":  "Switch Catalyst 2960G",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-086",
        "roomId":  "room-ccs",
        "name":  "Switch Catalyst 3560G",
        "category":  "Networking Equipment",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-087",
        "roomId":  "room-ccs",
        "name":  "System Unit Wire",
        "category":  "Cables and Connectors",
        "quantity":  28,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-088",
        "roomId":  "room-ccs",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-089",
        "roomId":  "room-admin",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-090",
        "roomId":  "room-css",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-091",
        "roomId":  "room-bp",
        "name":  "TENDA Router",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-092",
        "roomId":  "room-bp",
        "name":  "TENDA Tilt Camera",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-093",
        "roomId":  "room-css",
        "name":  "TENDA Tilt Camera",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Used",
        "condition":  "Used",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-094",
        "roomId":  "room-ccs",
        "name":  "TP-Link Router Archer C64",
        "category":  "Networking Equipment",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Empty",
        "condition":  "Empty",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-095",
        "roomId":  "room-ccs",
        "name":  "Unidentified Motherboard",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Deffective",
        "condition":  "Deffective",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-096",
        "roomId":  "room-ccs",
        "name":  "Unidentified System Unit Case",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-097",
        "roomId":  "room-ccs",
        "name":  "UPS",
        "category":  "PC Hardware and Components",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-098",
        "roomId":  "room-ccs",
        "name":  "USB External HDD All-in-one External Inclosure Storage",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-099",
        "roomId":  "room-ccs",
        "name":  "USB External HDD, 3.5 Enclosure",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-100",
        "roomId":  "room-ccs",
        "name":  "USB to RJ45",
        "category":  "Cables and Connectors",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-101",
        "roomId":  "room-ccs",
        "name":  "USB TO RS232",
        "category":  "Cables and Connectors",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-102",
        "roomId":  "room-ccs",
        "name":  "VGA to Display Port",
        "category":  "Cables and Connectors",
        "quantity":  3,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-103",
        "roomId":  "room-ccs",
        "name":  "VGA Wire",
        "category":  "Cables and Connectors",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-104",
        "roomId":  "room-ccs",
        "name":  "Video Card",
        "category":  "PC Hardware and Components",
        "quantity":  2,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-105",
        "roomId":  "room-ccs",
        "name":  "Web Cam",
        "category":  "Peripherals and Storage",
        "quantity":  6,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-106",
        "roomId":  "room-ccs",
        "name":  "Windows 10 Pro",
        "category":  "Operating System and Software",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-107",
        "roomId":  "room-ccs",
        "name":  "Windows Server 2022",
        "category":  "Operating System and Software",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-108",
        "roomId":  "room-ccs",
        "name":  "Wire Stripper",
        "category":  "Tools",
        "quantity":  19,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-109",
        "roomId":  "room-ccs",
        "name":  "Wireless Landline",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-110",
        "roomId":  "room-ccs",
        "name":  "Wireless N Ceiling Mount Access Point",
        "category":  "Networking Equipment",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-111",
        "roomId":  "room-ccs",
        "name":  "Wireless N Ceiling Mount Access Point",
        "category":  "Networking Equipment",
        "quantity":  10,
        "units":  "pcs",
        "status":  "Incomplete",
        "condition":  "Incomplete",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    },
    {
        "id":  "km100-112",
        "roomId":  "room-ccs",
        "name":  "YALE Smoke Detector",
        "category":  "Peripherals and Storage",
        "quantity":  1,
        "units":  "pcs",
        "status":  "Working",
        "condition":  "Working",
        "createdAt":  "2026-11-19T02:16:11Z",
        "updatedAt":  "2026-11-19T02:16:11Z"
    }];
```

---

### File: src\utils\supabaseClient.ts
```typescript
import { createClient } from '@supabase/supabase-js';

// KM100 Inventory System: Official Supabase Project
export const SUPABASE_CONFIG = {
  url: 'https://kpzancwkmbhnuqbnqrii.supabase.co',
  anonKey: 'sb_publishable_Op-yvVaKrb9kArQ2ieDefw_ueZNswLZ'
};

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

```

---

### File: src\utils\excelExport.ts
```typescript
import * as XLSX from 'xlsx';
import { ColumnDefinition, InventoryItem, Room } from '../types/inventory';

export function exportInventoryToExcel(
  mode: 'multi' | 'current',
  rooms: Room[],
  items: InventoryItem[],
  columns: ColumnDefinition[],
  selectedRoom?: Room
) {
  const wb = XLSX.utils.book_new();

  // Dynamically resolve columns consistent with system schema
  const activeCols = columns && columns.length > 0 ? columns : [
    { id: 'name', label: 'ITEM NAME', type: 'text', order: 1 },
    { id: 'category', label: 'CATEGORY', type: 'dropdown', order: 2 },
    { id: 'quantity', label: 'QUANTITY', type: 'number', order: 3 },
    { id: 'units', label: 'UNITS', type: 'dropdown', order: 4 },
    { id: 'status', label: 'Status', type: 'dropdown', order: 5 }
  ] as ColumnDefinition[];

  // Ensure Room column is represented
  const exportCols: { id: string; label: string; width: number; isNumber?: boolean; isStatus?: boolean }[] = [];
  let hasRoomCol = false;

  activeCols.forEach(col => {
    if (col.id === 'room' || col.id === 'roomId' || col.id === 'roomLocation') {
      hasRoomCol = true;
      exportCols.push({ id: '_room', label: col.label || 'ROOM', width: 32 });
    } else if (col.id === 'name') {
      exportCols.push({ id: 'name', label: col.label || 'ITEM NAME', width: 55 });
    } else if (col.id === 'category') {
      exportCols.push({ id: 'category', label: col.label || 'CATEGORY', width: 35 });
    } else if (col.id === 'quantity') {
      exportCols.push({ id: 'quantity', label: col.label || 'QUANTITY', width: 22, isNumber: true });
    } else if (col.id === 'units') {
      exportCols.push({ id: 'units', label: col.label || 'UNITS', width: 20 });
    } else if (col.id === 'status' || col.id === 'condition') {
      exportCols.push({ id: 'status', label: col.label || 'Status', width: 22, isStatus: true });
    } else {
      exportCols.push({
        id: col.id,
        label: col.label,
        width: Math.max(22, (col.label || '').length * 1.5 + 4),
        isNumber: col.type === 'number'
      });
    }
  });

  if (!hasRoomCol) {
    exportCols.push({ id: '_room', label: 'ROOM', width: 32 });
  }

  const numCols = exportCols.length;
  const getColLetter = (colIdx1Based: number) => {
    let letter = '';
    let temp = colIdx1Based;
    while (temp > 0) {
      const mod = (temp - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      temp = Math.floor((temp - mod) / 26);
    }
    return letter;
  };
  const lastColLetter = getColLetter(numCols);

  const buildRoomRows = (roomItems: InventoryItem[], defaultRoomName: string) => {
    const rows: (string | number)[][] = [
      exportCols.map(c => c.label)
    ];

    let totalQty = 0;
    roomItems.forEach(item => {
      const roomObj = rooms.find(r => r.id === item.roomId);
      const roomName = item.room || (roomObj ? roomObj.name : defaultRoomName);
      const q = Number(item.quantity) || 0;
      totalQty += q;

      const rowValues = exportCols.map(col => {
        if (col.id === '_room') return roomName;
        if (col.id === 'quantity') return q;
        if (col.id === 'status') return item.status || item.condition || 'Working';
        if (col.id === 'units') return item.units || 'pcs';
        return item[col.id] !== undefined ? item[col.id] : '';
      });
      rows.push(rowValues);
    });

    // Summary Total Row
    if (roomItems.length > 0) {
      const summaryRow: (string | number)[] = new Array(numCols).fill('');
      summaryRow[0] = 'TOTAL INVENTORY SUMMARY';
      if (numCols > 1) {
        summaryRow[1] = `${roomItems.length} catalog items`;
      }
      const qtyIdx = exportCols.findIndex(c => c.id === 'quantity');
      if (qtyIdx !== -1) {
        summaryRow[qtyIdx] = totalQty;
      }
      const unitsIdx = exportCols.findIndex(c => c.id === 'units');
      if (unitsIdx !== -1) {
        summaryRow[unitsIdx] = 'units total';
      }
      rows.push(summaryRow);
    }

    return rows;
  };

  const createStyledSheet = (rows: (string | number)[][], roomItems: InventoryItem[]) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Compute dynamic auto-fit column widths
    ws['!cols'] = exportCols.map(c => {
      let maxLen = (c.label || '').length;
      roomItems.forEach(item => {
        let val = '';
        if (c.id === '_room') {
          const roomObj = rooms.find(r => r.id === item.roomId);
          val = item.room || (roomObj ? roomObj.name : '');
        } else if (c.id === 'status') {
          val = item.status || item.condition || '';
        } else {
          val = item[c.id] !== undefined ? String(item[c.id]) : '';
        }
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.max(c.width || 20, Math.min(65, maxLen + 6)) };
    });

    if (rows.length > 1) {
      ws['!autofilter'] = { ref: `A1:${lastColLetter}${rows.length - 1}` };
    }
    return ws;
  };

  if (mode === 'multi') {
    // 1. Master Sheet matching system template
    const masterRows = buildRoomRows(items, 'All Rooms');
    const wsMaster = createStyledSheet(masterRows, items);
    XLSX.utils.book_append_sheet(wb, wsMaster, 'KM100 Inventory');

    // 2. Individual Room Sheets
    rooms.forEach(room => {
      const roomItems = items.filter(it => it.roomId === room.id);
      const rows = buildRoomRows(roomItems, room.name);
      const ws = createStyledSheet(rows, roomItems);
      const safeName = (room.name.replace(/[:\\/?*\[\]]/g, '') || 'Room').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });
  } else {
    const roomName = selectedRoom ? selectedRoom.name : 'KM100 Inventory';
    const roomItems = selectedRoom ? items.filter(it => it.roomId === selectedRoom.id) : items;
    const rows = buildRoomRows(roomItems, roomName);
    const ws = createStyledSheet(rows, roomItems);
    const safeName = (roomName.replace(/[:\\/?*\[\]]/g, '') || 'KM100 Inventory').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }

  XLSX.writeFile(wb, 'KM100_Skills_and_Training_Center,_Inc._INVENTORY.xlsx');
}

```

---

### File: src\components\ConditionBadge.tsx
```tsx
import React from 'react';
import { ItemCondition } from '../types/inventory';

interface Props {
  condition: ItemCondition | string;
}

export const ConditionBadge: React.FC<Props> = ({ condition }) => {
  const styles: Record<string, string> = {
    // Official KM100 Statuses
    'Working': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/80',
    'Used': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/80',
    'Defective': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80',
    'Deffective': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80',
    'Empty': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    'Incomplete': 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-700/80',

    // Standard Fallbacks
    'Good': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/80',
    'Fair': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/80',
    'Needs Repair': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80',
    'Condemned': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700/80'
  };

  const dotColors: Record<string, string> = {
    'Working': 'bg-emerald-500',
    'Used': 'bg-amber-500',
    'Defective': 'bg-rose-500',
    'Deffective': 'bg-rose-500',
    'Empty': 'bg-slate-400',
    'Incomplete': 'bg-orange-500',
    'Good': 'bg-emerald-500',
    'Fair': 'bg-amber-500',
    'Needs Repair': 'bg-rose-500',
    'Condemned': 'bg-rose-500'
  };

  const baseClass = styles[condition] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const dotClass = dotColors[condition] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${baseClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`}></span>
      {condition || 'Unknown'}
    </span>
  );
};

```

---

### File: src\components\ColumnsSchemaModal.tsx
```tsx
import React, { useState } from 'react';
import { ColumnDefinition, ColumnType } from '../types/inventory';
import { Sliders, X, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  onSave: (newColumns: ColumnDefinition[]) => void;
}

export const ColumnsSchemaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  columns,
  onSave
}) => {
  const [localCols, setLocalCols] = useState<ColumnDefinition[]>(() =>
    JSON.parse(JSON.stringify(columns))
  );
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<ColumnType>('text');
  const [newColOptions, setNewColOptions] = useState('Option 1, Option 2, Option 3');

  if (!isOpen) return null;

  const moveColumn = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= localCols.length) return;
    const copy = [...localCols];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setLocalCols(copy);
  };

  const deleteColumn = (colId: string) => {
    setLocalCols(prev => prev.filter(c => c.id !== colId));
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    const id = `custom_${Date.now()}`;
    const newCol: ColumnDefinition = {
      id,
      label: newColLabel.trim(),
      type: newColType,
      required: false,
      isSystem: false,
      order: localCols.length + 1
    };

    if (newColType === 'dropdown') {
      newCol.options = newColOptions
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (newCol.options.length === 0) newCol.options = ['Default Option'];
    }

    setLocalCols([...localCols, newCol]);
    setNewColLabel('');
    setNewColOptions('Option 1, Option 2, Option 3');
  };

  const handleSave = () => {
    const reindexed = localCols.map((c, i) => ({ ...c, order: i + 1 }));
    onSave(reindexed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sliders size={18} />
            </div>
            <div>
              <h3 id="schema-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Customize Inventory Columns (Schema Builder)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dynamically add, rename, reorder, and configure table & export columns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              Active Table Columns ({localCols.length})
            </h4>
            <div className="space-y-2">
              {localCols.map((col, idx) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={col.label}
                      onChange={e => {
                        const val = e.target.value;
                        setLocalCols(prev =>
                          prev.map(c => (c.id === col.id ? { ...c, label: val } : c))
                        );
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 flex-1 max-w-[200px]"
                    />
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {col.type}
                    </span>
                    {col.isSystem && (
                      <span className="text-[10px] text-amber-700 font-semibold italic">Core Field</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveColumn(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveColumn(idx, 1)}
                      disabled={idx === localCols.length - 1}
                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown size={13} />
                    </button>
                    {!col.isSystem && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(col.id)}
                        className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                        title="Delete Column"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Column Box */}
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Plus size={13} /> Add New Custom Column
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Column Label / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serial Number, Supplier, Barcode"
                  value={newColLabel}
                  onChange={e => setNewColLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data Type
                </label>
                <select
                  value={newColType}
                  onChange={e => setNewColType(e.target.value as ColumnType)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="text">Text (String)</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown Select</option>
                </select>
              </div>
            </div>

            {newColType === 'dropdown' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dropdown Options (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In Stock, Out of Stock, On Order"
                  value={newColOptions}
                  onChange={e => setNewColOptions(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddColumn}
              disabled={!newColLabel.trim()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-40 transition-colors"
            >
              Insert Column to Schema
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            Save Column Layout
          </button>
        </div>
      </div>
    </div>
  );
};

```

---

### File: src\components\RoomModal.tsx
```tsx
import React, { useState } from 'react';
import { Room } from '../types/inventory';
import { Building, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingRoom: Room | null;
  onSave: (savedRoom: Room) => void;
}

export const RoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingRoom,
  onSave
}) => {
  const [name, setName] = useState(editingRoom ? editingRoom.name : '');
  const [description, setDescription] = useState(editingRoom ? editingRoom.description || '' : '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      name: name.trim(),
      description: description.trim()
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="./logo.png"
              alt="KM100 Logo"
              className="w-9 h-9 object-contain rounded-full bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "./favicon.png";
              }}
            />
            <div>
              <h3 id="room-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                {editingRoom ? 'Rename Facility Room' : 'Add New Facility Room'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KM100 Skills and Training Center, Inc.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Room Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Lab 2, Electrical Workshop"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Purpose (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dedicated practical lab for network certification courses"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

```

---

### File: src\components\ItemModal.tsx
```tsx
import React, { useState } from 'react';
import { ColumnDefinition, InventoryItem, Room } from '../types/inventory';
import { Plus, Edit2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: InventoryItem | null;
  columns: ColumnDefinition[];
  rooms: Room[];
  selectedRoomId: string;
  onSave: (savedItem: InventoryItem) => void;
}

export const ItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingItem,
  columns,
  rooms,
  selectedRoomId,
  onSave
}) => {
  const defaultRoom = selectedRoomId !== 'ALL' ? selectedRoomId : (rooms[0]?.id || '');

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (editingItem) {
      return { ...editingItem };
    }
    const initial: Record<string, any> = {
      roomId: defaultRoom,
      name: '',
      quantity: 1,
      units: 'pcs',
      status: 'Working',
      condition: 'Working',
      category: 'Tools',
      remarks: ''
    };
    columns.forEach(col => {
      if (initial[col.id] === undefined) {
        initial[col.id] = col.type === 'number' ? 0 : '';
      }
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Item Name is required.');
      return;
    }
    if (!formData.roomId) {
      alert('Please select a facility room.');
      return;
    }

    const now = new Date().toISOString();
    const payload: InventoryItem = {
      ...formData,
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: formData.name.trim(),
      roomId: formData.roomId,
      category: formData.category || 'General',
      condition: formData.condition || 'Good',
      quantity: Number(formData.quantity) || 0,
      updatedAt: now,
      createdAt: editingItem?.createdAt || now
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="./logo.png"
              alt="KM100 Logo"
              className="w-9 h-9 object-contain rounded-full bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "./favicon.png";
              }}
            />
            <div>
              <h3 id="item-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KM100 Skills and Training Center, Inc.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Facility Room <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-medium"
              required
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {columns.map(col => {
            const val = formData[col.id] !== undefined ? formData[col.id] : '';

            if (col.type === 'dropdown') {
              const options =
                col.options && col.options.length > 0
                  ? col.options
                  : (col.id === 'status' || col.id === 'condition'
                      ? ['Working', 'Used', 'Defective', 'Empty', 'Incomplete']
                      : col.id === 'units'
                        ? ['pcs', 'set', 'box', 'roll', 'pack']
                        : ['Tools', 'PC Hardware', 'Peripheral', 'Cables and Wires', 'Consumables', 'Diagnostic', 'Networking']);
              return (
                <div key={col.id}>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {col.label} {col.required && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    value={val}
                    onChange={e => setFormData({ ...formData, [col.id]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-medium"
                    required={col.required}
                  >
                    {options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (col.type === 'number') {
              return (
                <div key={col.id}>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {col.label} {col.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={val}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        [col.id]: e.target.value === '' ? '' : Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-mono"
                    required={col.required}
                  />
                </div>
              );
            }

            return (
              <div key={col.id}>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {col.label} {col.required && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${col.label.toLowerCase()}...`}
                  value={val}
                  onChange={e => setFormData({ ...formData, [col.id]: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white"
                  required={col.required}
                />
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              {editingItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

```

---

### File: src\components\Sidebar.tsx
```tsx
import React from 'react';
import { Building, LayoutDashboard, Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Room } from '../types/inventory';

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
}

export const Sidebar: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  totalItemsCount,
  roomItemCounts
}) => {
  return (
    <aside className="hidden md:flex w-64 lg:w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-20 transition-colors">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building size={14} /> Training Facilities
        </span>
        <button
          onClick={onAddRoom}
          className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
          title="Add New Room"
          aria-label="Add new facility room"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Room Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* All Rooms Button */}
        <button
          onClick={() => onSelectRoom('ALL')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            selectedRoomId === 'ALL'
              ? 'bg-amber-700 text-white shadow-sm shadow-amber-600/30'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard size={16} />
            <span>All Rooms Overview</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums ${
              selectedRoomId === 'ALL'
                ? 'bg-amber-800 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {totalItemsCount}
          </span>
        </button>

        <div className="pt-2 pb-1 px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Individual Rooms ({rooms.length})
          </span>
        </div>

        {rooms.map(room => {
          const counts = roomItemCounts[room.id] || { unique: 0, totalQty: 0 };
          const isSelected = selectedRoomId === room.id;

          return (
            <div
              key={room.id}
              className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/80 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <button
                onClick={() => onSelectRoom(room.id)}
                className="flex-1 text-left truncate pr-2 flex items-center gap-2"
                title={room.name}
              >
                <Package
                  size={14}
                  className={isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}
                />
                <span className="truncate">{room.name}</span>
              </button>

              <div className="flex items-center gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums ${
                    isSelected
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {counts.unique}
                </span>

                <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onEditRoom(room);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Rename Room"
                    aria-label={`Rename ${room.name}`}
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteRoom(room);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Room"
                    aria-label={`Delete ${room.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
            No rooms created yet.
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={onAddRoom}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 transition-colors"
        >
          <Plus size={14} /> Add New Facility Room
        </button>
      </div>
    </aside>
  );
};

```

---

### File: src\components\Header.tsx
```tsx
import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sliders,
  Settings,
  ChevronDown,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Layers,
  Building,
  Printer
} from 'lucide-react';
import { Room } from '../types/inventory';

interface Props {
  onOpenColumnsModal: () => void;
  onExportExcel: (mode: 'multi' | 'current') => void;
  onTriggerUploadExcel?: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  selectedRoomId: string;
  currentRoom?: Room;
}

export const Header: React.FC<Props> = ({
  onOpenColumnsModal,
  onExportExcel,
  onTriggerUploadExcel,
  onExportBackup,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
  selectedRoomId,
  currentRoom
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 transition-colors no-print">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Title & Official Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="KM100 Skills and Training Center Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "./logo.png";
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base lg:text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
                <span className="sm:hidden">KM100 Training</span>
                <span className="hidden sm:inline">KM100 Skills and Training Center, Inc.</span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">
              Inventory Management System • Institutional OS
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Upload & Convert Excel Button */}
          {onTriggerUploadExcel && (
            <button
              onClick={onTriggerUploadExcel}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
              title="Upload Excel (.xlsx, .xls) or CSV to convert & add directly to inventory"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden md:inline">Upload Excel</span>
            </button>
          )}

          {/* Excel Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98]"
              title="Export to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden md:inline">Export Excel</span>
              <ChevronDown size={12} />
            </button>

            {isExportDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-modal text-xs"
                onMouseLeave={() => setIsExportDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Official System Export
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    UI Styled
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('multi');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Layers size={14} />
                      Multi-Sheet Excel Workbook
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    Master Inventory + 4 colored room facility tabs
                  </span>
                  <div className="flex items-center gap-1 pl-5 mt-1.5">
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                      Dual Logos
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      Pill Badges
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      =SUM() Formulas
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportDropdownOpen(false);
                    onExportExcel('current');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 flex flex-col border-t border-slate-100 dark:border-slate-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building size={14} />
                      Current View Sheet Only
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">.xlsx</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 mt-0.5">
                    {selectedRoomId === 'ALL'
                      ? 'All active catalog items with condition badges'
                      : (currentRoom?.name ?? 'Current Room')}
                  </span>
                </button>

                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 text-center rounded-b-xl">
                  ✓ Styled to match system UI & Condition Badges
                </div>
              </div>
            )}
          </div>

          {/* Print Audit Sheet */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Print Official Physical Inventory Sheet (Letter/A4)"
          >
            <Printer size={15} />
            <span className="hidden lg:inline">Print Sheet</span>
          </button>

          {/* Schema Builder */}
          <button
            onClick={onOpenColumnsModal}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Configure Inventory Schema Columns"
          >
            <Sliders size={16} />
          </button>

          {/* Settings & Backups */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Data & Backup Settings"
            >
              <Settings size={16} />
            </button>

            {isSettingsOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-modal text-xs"
                onMouseLeave={() => setIsSettingsOpen(false)}
              >
                <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                  Data & Backup Controls
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onExportBackup();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Download size={14} className="text-amber-600" />
                    <div>
                      <div className="font-semibold">Export JSON Backup</div>
                      <div className="text-[10px] text-slate-400">Save complete database file</div>
                    </div>
                  </button>

                  <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">
                    <Upload size={14} className="text-emerald-500" />
                    <div>
                      <div className="font-semibold">Restore JSON Backup</div>
                      <div className="text-[10px] text-slate-400">Upload and restore system state</div>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        setIsSettingsOpen(false);
                        onImportBackup(e);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onResetSampleData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                    >
                      <RefreshCw size={14} />
                      <div>
                        <div className="font-semibold">Reset Official KM100 Catalog</div>
                        <div className="text-[10px] text-amber-600/70">Revert to 114 verified items</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onClearAllData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 mt-1"
                    >
                      <Trash2 size={14} />
                      <div>
                        <div className="font-semibold">Purge All Inventory Data</div>
                        <div className="text-[10px] text-rose-500/70">Clear all records and facilities</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

```

---

### File: src\components\OverviewDashboard.tsx
```tsx
import React from 'react';
import { Building, Package, Layers, ShieldCheck, Plus, ChevronRight, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Room, InventoryItem } from '../types/inventory';

interface Props {
  rooms: Room[];
  items: InventoryItem[];
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  onSelectRoom: (roomId: string) => void;
  onAddItem: () => void;
}

export const OverviewDashboard: React.FC<Props> = ({
  rooms,
  items,
  roomItemCounts,
  onSelectRoom,
  onAddItem
}) => {
  const totalRooms = rooms.length;
  const totalUniqueItems = items.length;
  const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

  let operationalCount = 0;

  items.forEach(it => {
    const qty = Number(it.quantity) || 0;
    const cond = it.status || it.condition || 'Working';
    if (cond === 'Working' || cond === 'Used' || cond === 'Good' || cond === 'Fair') {
      operationalCount += qty;
    }
  });

  const operationalPct =
    totalQuantity > 0 ? Math.round((operationalCount / totalQuantity) * 100) : 100;

  return (
    <div className="p-4 lg:p-6 bg-gradient-to-b from-amber-50/60 to-transparent dark:from-amber-950/20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Institutional Overview Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consolidated training equipment and physical asset portfolio
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Add Inventory Item
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Rooms</span>
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Building size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {totalRooms}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Configured training rooms</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unique Items</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Package size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {totalUniqueItems}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Distinct catalog SKUs</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Quantity</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Layers size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {totalQuantity}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Physical units tracked</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Condition Health</span>
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <ShieldCheck size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tabular-nums">
              {operationalPct}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Good & Fair operational units</p>
          </div>
        </div>

        {/* Room Breakdown Grid */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Facility Breakdown by Room
            </h3>
            <span className="text-xs text-slate-400">Click any room card to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rooms.map(room => {
              const counts = roomItemCounts[room.id] || { unique: 0, totalQty: 0 };
              const rItems = items.filter(i => i.roomId === room.id);
              const needsAction = rItems
                .filter(i => i.condition === 'Needs Repair' || i.condition === 'Condemned')
                .reduce((a, b) => a + (Number(b.quantity) || 0), 0);

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-950/40 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate">
                      {room.name}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">
                    {room.description || 'Facility room'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800/80 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">{counts.unique}</strong> items
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      <strong className="text-emerald-700 dark:text-emerald-300">{counts.totalQty}</strong> units
                    </span>
                  </div>

                  {needsAction > 0 && (
                    <div className="mt-2 text-[10px] text-rose-500 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> {needsAction} units require attention
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

```

---

### File: src\components\InventoryTable.tsx
```tsx
import React from 'react';
import { ColumnDefinition, InventoryItem, Room } from '../types/inventory';
import { ConditionBadge } from './ConditionBadge';
import { ArrowUpDown, ChevronUp, ChevronDown, Plus, Minus, Edit, Trash2, Building, Package } from 'lucide-react';

interface Props {
  items: InventoryItem[];
  columns: ColumnDefinition[];
  rooms: Room[];
  selectedRoomId: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (colId: string) => void;
  onSelectRoom: (roomId: string) => void;
  onQuantityChange: (itemId: string, delta: number) => void;
  onSetQuantity?: (itemId: string, qty: number) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onAddItem: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalItemsInCatalog: number;
}

export const InventoryTable: React.FC<Props> = ({
  items,
  columns,
  rooms,
  selectedRoomId,
  sortField,
  sortDirection,
  onSort,
  onSelectRoom,
  onQuantityChange,
  onSetQuantity,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onResetFilters,
  isFiltered,
  totalItemsInCatalog
}) => {
  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div className="flex-1 overflow-x-auto overflow-y-auto overscroll-contain [webkit-overflow-scrolling:touch]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              {selectedRoomId === 'ALL' && (
                <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Room Location
                </th>
              )}

              {columns.map(col => (
                <th
                  key={col.id}
                  onClick={() => onSort(col.id)}
                  aria-sort={sortField === col.id ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {sortField === col.id ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp size={13} className="text-amber-700" />
                      ) : (
                        <ChevronDown size={13} className="text-amber-700" />
                      )
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>
              ))}

              <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map(item => {
              const itemRoom = rooms.find(r => r.id === item.roomId);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors group"
                >
                  {selectedRoomId === 'ALL' && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        onClick={() => onSelectRoom(item.roomId)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer transition-colors"
                        title="Jump to this room"
                      >
                        <Building size={12} className="text-amber-700" />
                        {itemRoom?.name || 'Unassigned'}
                      </span>
                    </td>
                  )}

                  {columns.map(col => {
                    const val = item[col.id];

                    if (col.id === 'condition' || col.id === 'status') {
                      return (
                        <td key={col.id} className="py-3 px-4 whitespace-nowrap">
                          <ConditionBadge condition={val || item.status || item.condition || 'Working'} />
                        </td>
                      );
                    }

                    if (col.id === 'quantity') {
                      const numVal = Number(val) || 0;
                      return (
                        <td key={col.id} className="py-3 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1 shadow-inner">
                            <button
                              onClick={() => onQuantityChange(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors shadow-sm disabled:opacity-40"
                              disabled={numVal <= 0}
                              title="Decrease quantity by 1"
                            >
                              <Minus size={12} />
                            </button>

                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min={0}
                              value={numVal}
                              onChange={(e) => {
                                const parsed = Math.max(0, parseInt(e.target.value, 10) || 0);
                                if (onSetQuantity) {
                                  onSetQuantity(item.id, parsed);
                                } else {
                                  onQuantityChange(item.id, parsed - numVal);
                                }
                              }}
                              aria-label={`Manual quantity input for ${item.name}`}
                              title="Click to type or edit quantity directly"
                              className="w-12 px-1 py-0.5 text-center font-mono font-bold tabular-nums text-xs text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-orange-500 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                              onClick={() => onQuantityChange(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 transition-colors shadow-sm"
                              title="Increase quantity by 1"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={col.id} className="py-3 px-4">
                        {col.id === 'name' ? (
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {val || '—'}
                          </span>
                        ) : col.id === 'category' ? (
                          <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {val || '—'}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">
                            {val !== undefined && val !== null && val !== '' ? String(val) : '—'}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditItem(item)}
                        aria-label={`Edit ${item.name}`}
                        className="p-1.5 text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <strong className="text-slate-900 dark:text-white font-mono">{items.length}</strong> of{' '}
          <span className="font-mono">{totalItemsInCatalog}</span> total items
        </div>
        <div className="font-mono">
          Filtered Subtotal:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}
          </strong>{' '}
          units
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="py-16 px-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Package size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Inventory Items Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {isFiltered
              ? 'No items match your active search and filter parameters. Try clearing your filters.'
              : 'This room has no items registered yet. Click below to add your first training inventory item.'}
          </p>
          {isFiltered ? (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            >
              Clear Search & Filters
            </button>
          ) : (
            <button
              onClick={onAddItem}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm"
            >
              Add New Item
            </button>
          )}
        </div>
      )}
    </div>
  );
};

```

---

### File: src\App.tsx
```tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDefinition,
  InventoryItem,
  Room
} from './types/inventory';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { InventoryTable } from './components/InventoryTable';
import { ItemModal } from './components/ItemModal';
import { ColumnsSchemaModal } from './components/ColumnsSchemaModal';
import { RoomModal } from './components/RoomModal';
import { exportInventoryToExcel } from './utils/excelExport';
import { Search, Filter, X, Edit, Plus, AlertTriangle, Check, Sparkles } from 'lucide-react';

const STORAGE_KEY_ROOMS = 'km100_inventory_rooms_v1';
const STORAGE_KEY_ITEMS = 'km100_inventory_items_v1';
const STORAGE_KEY_COLUMNS = 'km100_inventory_columns_v1';
const STORAGE_KEY_THEME = 'km100_inventory_theme_v1';

import { DEFAULT_COLUMNS, DEFAULT_ROOMS, DEFAULT_ITEMS } from './data/defaultData';

export function App() {
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
      return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
    } catch {
      return DEFAULT_ROOMS;
    }
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [columns, setColumns] = useState<ColumnDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch {
      return DEFAULT_COLUMNS;
    }
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // Lock system strictly to Light Mode
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem(STORAGE_KEY_THEME);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
  }, [columns]);

  // Impeccable A11y: Escape Key to dismiss modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDialog) setConfirmDialog(null);
        else if (isItemModalOpen) setIsItemModalOpen(false);
        else if (isColumnsModalOpen) setIsColumnsModalOpen(false);
        else if (isRoomModalOpen) setIsRoomModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog, isItemModalOpen, isColumnsModalOpen, isRoomModalOpen]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const currentRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  const roomItemCounts = useMemo(() => {
    const counts: Record<string, { unique: number; totalQty: number }> = {};
    rooms.forEach(r => {
      counts[r.id] = { unique: 0, totalQty: 0 };
    });
    items.forEach(item => {
      if (counts[item.roomId]) {
        counts[item.roomId].unique += 1;
        counts[item.roomId].totalQty += Number(item.quantity) || 0;
      }
    });
    return counts;
  }, [rooms, items]);

  const availableCategories = useMemo(() => {
    const catCol = columns.find(c => c.id === 'category');
    if (catCol && catCol.options && catCol.options.length > 0) {
      return catCol.options;
    }
    const set = new Set<string>();
    items.forEach(it => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [columns, items]);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (selectedRoomId !== 'ALL' && item.roomId !== selectedRoomId) return false;
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
        if (conditionFilter !== 'ALL' && item.condition !== conditionFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matches = Object.entries(item).some(([k, val]) => {
            if (k === 'id' || k === 'roomId' || k === 'createdAt' || k === 'updatedAt') return false;
            return String(val).toLowerCase().includes(q);
          });
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const comp = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [items, selectedRoomId, categoryFilter, conditionFilter, searchQuery, sortField, sortDirection]);

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          const newQty = Math.max(0, (Number(it.quantity) || 0) + delta);
          return { ...it, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
  };

  const handleSetQuantity = (itemId: string, newQty: number) => {
    const val = Math.max(0, newQty || 0);
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          return { ...it, quantity: val, updatedAt: new Date().toISOString() };
        }
        return it;
      })
    );
  };

  const confirmDeleteItem = (item: InventoryItem) => {
    setConfirmDialog({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: () => {
        setItems(prev => prev.filter(i => i.id !== item.id));
        showToast(`Deleted "${item.name}"`, 'success');
        setConfirmDialog(null);
      }
    });
  };

  const confirmDeleteRoom = (room: Room) => {
    const roomItems = items.filter(i => i.roomId === room.id);
    const count = roomItems.length;
    setConfirmDialog({
      title: `Delete Room: ${room.name}`,
      message: `Deleting this room will also permanently delete ${count} associated inventory ${
        count === 1 ? 'item' : 'items'
      }. Proceed?`,
      isDestructive: true,
      onConfirm: () => {
        setRooms(prev => prev.filter(r => r.id !== room.id));
        setItems(prev => prev.filter(i => i.roomId !== room.id));
        if (selectedRoomId === room.id) setSelectedRoomId('ALL');
        showToast(`Room "${room.name}" removed`, 'success');
        setConfirmDialog(null);
      }
    });
  };

  const handleResetSampleData = () => {
    setConfirmDialog({
      title: 'Reset to Sample Data',
      message:
        'This will replace all current rooms, custom columns, and items with the default KM100 training center catalog. Proceed?',
      isDestructive: true,
      onConfirm: () => {
        setRooms(DEFAULT_ROOMS);
        setItems(DEFAULT_ITEMS);
        setColumns(DEFAULT_COLUMNS);
        setSelectedRoomId('ALL');
        showToast('Reset to default training center sample data', 'info');
        setConfirmDialog(null);
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      title: 'Clear All Inventory Data',
      message:
        'Are you sure you want to clear all rooms and items? This creates a completely empty fresh inventory workspace.',
      isDestructive: true,
      onConfirm: () => {
        setRooms([]);
        setItems([]);
        setSelectedRoomId('ALL');
        showToast('All inventory cleared', 'info');
        setConfirmDialog(null);
      }
    });
  };

  const handleBackupExport = () => {
    const payload = {
      version: '1.0',
      organization: 'KM100 Skills and Training Center, Inc.',
      exportedAt: new Date().toISOString(),
      rooms,
      columns,
      items
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KM100_Inventory_Backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully');
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.rooms || !data.items || !data.columns) {
          throw new Error('Invalid backup file structure.');
        }
        setRooms(data.rooms);
        setItems(data.items);
        setColumns(data.columns);
        setSelectedRoomId('ALL');
        showToast('Inventory backup successfully restored!', 'success');
      } catch {
        alert('Failed to parse backup JSON file. Please ensure it is a valid KM100 backup export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSort = (columnId: string) => {
    if (sortField === columnId) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(columnId);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header
        onOpenColumnsModal={() => setIsColumnsModalOpen(true)}
        onExportExcel={mode => exportInventoryToExcel(mode, rooms, items, columns, currentRoom)}
        onExportBackup={handleBackupExport}
        onImportBackup={handleBackupImport}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        selectedRoomId={selectedRoomId}
        currentRoom={currentRoom}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onAddRoom={() => {
            setEditingRoom(null);
            setIsRoomModalOpen(true);
          }}
          onEditRoom={room => {
            setEditingRoom(room);
            setIsRoomModalOpen(true);
          }}
          onDeleteRoom={confirmDeleteRoom}
          totalItemsCount={items.length}
          roomItemCounts={roomItemCounts}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {selectedRoomId === 'ALL' && (
            <OverviewDashboard
              rooms={rooms}
              items={items}
              roomItemCounts={roomItemCounts}
              onSelectRoom={setSelectedRoomId}
              onAddItem={() => {
                if (rooms.length === 0) {
                  alert('Please create at least one room first.');
                  return;
                }
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            />
          )}

          {selectedRoomId !== 'ALL' && currentRoom && (
            <div className="p-4 lg:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRoomId('ALL')}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Facilities
                    </button>
                    <span className="text-slate-400 text-xs">/</span>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {currentRoom.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentRoom.description || 'Room Inventory Catalog'} &bull;{' '}
                    {roomItemCounts[currentRoom.id]?.unique || 0} unique items,{' '}
                    {roomItemCounts[currentRoom.id]?.totalQty || 0} total units
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRoom(currentRoom);
                      setIsRoomModalOpen(true);
                    }}
                    className="p-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Edit Room Details"
                  >
                    <Edit size={15} />
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98]"
                  >
                    <Plus size={16} /> Add Item to {currentRoom.name}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Area */}
          <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
            <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
              {/* Filter Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items, category, remarks, or custom fields..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                    <Filter size={13} className="text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-500">Cat:</span>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Condition:</span>
                    <select
                      value={conditionFilter}
                      onChange={e => setConditionFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Conditions</option>
                      <option value="Working">Working</option>
                      <option value="Used">Used</option>
                      <option value="Deffective">Deffective</option>
                      <option value="Empty">Empty</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  </div>

                  {(searchQuery || categoryFilter !== 'ALL' || conditionFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('ALL');
                        setConditionFilter('ALL');
                      }}
                      className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <InventoryTable
                items={filteredItems}
                columns={columns}
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectRoom={setSelectedRoomId}
                onQuantityChange={handleQuantityChange}
                onSetQuantity={handleSetQuantity}
                onEditItem={item => {
                  setEditingItem(item);
                  setIsItemModalOpen(true);
                }}
                onDeleteItem={confirmDeleteItem}
                onAddItem={() => {
                  if (rooms.length === 0) {
                    alert('Please create a room first.');
                    return;
                  }
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                onResetFilters={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setConditionFilter('ALL');
                }}
                isFiltered={Boolean(searchQuery || categoryFilter !== 'ALL' || conditionFilter !== 'ALL')}
                totalItemsInCatalog={items.length}
              />
            </div>
          </div>
        </main>
      </div>

      {isItemModalOpen && (
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          editingItem={editingItem}
          columns={columns}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSave={savedItem => {
            if (editingItem) {
              setItems(prev => prev.map(i => (i.id === savedItem.id ? savedItem : i)));
              showToast(`Updated item "${savedItem.name}"`, 'success');
            } else {
              setItems(prev => [savedItem, ...prev]);
              showToast(`Added item "${savedItem.name}"`, 'success');
            }
            setIsItemModalOpen(false);
          }}
        />
      )}

      {isColumnsModalOpen && (
        <ColumnsSchemaModal
          isOpen={isColumnsModalOpen}
          onClose={() => setIsColumnsModalOpen(false)}
          columns={columns}
          onSave={newCols => {
            setColumns(newCols);
            showToast('Inventory column schema updated successfully!', 'success');
            setIsColumnsModalOpen(false);
          }}
        />
      )}

      {isRoomModalOpen && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          editingRoom={editingRoom}
          onSave={savedRoom => {
            if (editingRoom) {
              setRooms(prev => prev.map(r => (r.id === savedRoom.id ? savedRoom : r)));
              showToast(`Renamed room to "${savedRoom.name}"`, 'success');
            } else {
              setRooms(prev => [...prev, savedRoom]);
              setSelectedRoomId(savedRoom.id);
              showToast(`Created facility room "${savedRoom.name}"`, 'success');
            }
            setIsRoomModalOpen(false);
          }}
        />
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700'
                }`}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98] ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-700 hover:bg-amber-800'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-toast ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-700 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <Sparkles size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;

```

---

### File: backend\database\schema.sql
```sql
-- ==============================================================================
-- KM100 SKILLS AND TRAINING CENTER, INC.
-- Supabase PostgreSQL Database Schema
-- Version: 2.0.0
-- ==============================================================================

-- 1. Facility Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dynamic Column Schema Table (Text, Number, Dropdown)
CREATE TABLE IF NOT EXISTS public.columns_schema (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    order_index INT NOT NULL DEFAULT 0,
    options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Items & Equipment Register
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    quantity NUMERIC NOT NULL DEFAULT 0,
    units TEXT NOT NULL DEFAULT 'pcs',
    condition TEXT NOT NULL DEFAULT 'Working',
    remarks TEXT DEFAULT '',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_inventory_items_room ON public.inventory_items(room_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_condition ON public.inventory_items(condition);

-- 4. Row Level Security (RLS) Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.rooms FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.columns_schema FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.columns_schema FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.inventory_items FOR ALL USING (true);

-- 5. Real-Time Subscription Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms, public.columns_schema, public.inventory_items;

```

---

### File: backend\database\seed.sql
```sql
-- ==============================================================================
-- KM100 SKILLS AND TRAINING CENTER, INC. - INITIAL SEED DATA
-- ==============================================================================

-- 1. Insert Facility Rooms
INSERT INTO public.rooms (id, name, description) VALUES
('room-ccs', 'Contact Center Services', 'Contact Center Services Training Lab'),
('room-admin', 'Admin Office', 'KM100 Administration & Operations Office'),
('room-css', 'Computer System Servicing', 'Computer Systems Servicing NC II Lab'),
('room-bp', 'Bread & Pastry', 'Bread and Pastry Production Training Facility'),
('room-avr', 'Audio Visual Room', 'Facility room'),
('room-lib', 'Library', 'Facility room'),
('room-lr1', 'Lecture Room 1', 'Facility room'),
('room-lr2', 'Lecture Room 2', 'Facility room'),
('room-lr3', 'Lecture Room 3', 'Facility room'),
('room-fb', 'Food & Beverages', 'Facility room'),
('room-hk', 'Housekeeping', 'Facility room'),
('room-eccd', 'Early Childhood Care Development', 'Facility room')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. Insert Columns Schema
INSERT INTO public.columns_schema (id, label, type, order_index, options) VALUES
('name', 'ITEM NAME', 'text', 1, '[]'::jsonb),
('category', 'CATEGORY', 'dropdown', 2, '["Tools", "Consumables and Maintenance", "Peripherals and Storage", "PC Hardware and Components", "Diagnostic and Testing", "Cables and Connectors", "Networking Equipment", "Operating System and Software"]'::jsonb),
('quantity', 'QUANTITY', 'number', 3, '[]'::jsonb),
('units', 'UNITS', 'dropdown', 4, '["pcs", "case", "box", "bag"]'::jsonb),
('status', 'Status', 'dropdown', 5, '["Working", "Empty", "Deffective", "Used", "Incomplete"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert All Official KM100 Catalog Items
INSERT INTO public.inventory_items (id, room_id, name, category, quantity, units, condition, remarks) VALUES
('km100-001', 'room-ccs', '100 in 1 Precision Screwdriver', 'Tools', 2, 'pcs', 'Working', ''),
('km100-002', 'room-ccs', '191ml WD-40', 'Consumables and Maintenance', 1, 'pcs', 'Working', ''),
('km100-003', 'room-ccs', '2.0 Flash Drive 16GB', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-004', 'room-ccs', '2.5 HDD External Case', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-005', 'room-ccs', '2.5 HDD External Case', 'Peripherals and Storage', 1, 'pcs', 'Empty', ''),
('km100-006', 'room-ccs', '3 in 1 Printer with Wireless Access', 'PC Hardware and Components', 1, 'pcs', 'Deffective', ''),
('km100-007', 'room-ccs', '3.0 Flash Drive 128GB', 'Peripherals and Storage', 3, 'pcs', 'Working', ''),
('km100-008', 'room-ccs', '32 in 1 Precision Screwdriver', 'Tools', 4, 'pcs', 'Working', ''),
('km100-009', 'room-ccs', '44 in 1 Precision Screwdriver', 'Tools', 5, 'pcs', 'Working', ''),
('km100-010', 'room-ccs', '7 in 1 Stainless Steel Cutter', 'Tools', 6, 'pcs', 'Working', ''),
('km100-011', 'room-ccs', '9V Battery', 'Consumables and Maintenance', 27, 'pcs', 'Working', ''),
('km100-012', 'room-ccs', 'A4Tech HU-9 USB Headset', 'Peripherals and Storage', 14, 'pcs', 'Working', ''),
('km100-013', 'room-ccs', 'ALHUA CCTV', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-014', 'room-ccs', 'Allen Wrench 8pcs', 'Tools', 10, 'pcs', 'Working', ''),
('km100-015', 'room-ccs', 'Allen Wrench 9pcs', 'Tools', 3, 'pcs', 'Working', ''),
('km100-016', 'room-ccs', 'Analog Multimeter Sanwa', 'Diagnostic and Testing', 10, 'pcs', 'Working', ''),
('km100-017', 'room-ccs', 'Anti-static Wrist Strap', 'Consumables and Maintenance', 19, 'pcs', 'Working', ''),
('km100-018', 'room-ccs', 'Bootable Drive', 'Peripherals and Storage', 6, 'pcs', 'Working', ''),
('km100-019', 'room-ccs', 'Cat 6', 'Cables and Connectors', 26, 'pcs', 'Working', ''),
('km100-020', 'room-ccs', 'CDR ', 'PC Hardware and Components', 27, 'pcs', 'Working', ''),
('km100-021', 'room-ccs', 'CDR-W', 'PC Hardware and Components', 64, 'pcs', 'Working', ''),
('km100-022', 'room-ccs', 'China Router', 'Networking Equipment', 6, 'pcs', 'Working', ''),
('km100-023', 'room-ccs', 'Cisco Switch Catalyst 3750', 'Networking Equipment', 8, 'pcs', 'Working', ''),
('km100-024', 'room-ccs', 'Cleaning Brush', 'Consumables and Maintenance', 24, 'pcs', 'Working', ''),
('km100-025', 'room-ccs', 'Combination Pliers', 'Tools', 10, 'pcs', 'Working', ''),
('km100-026', 'room-ccs', 'Cooling Pan', 'PC Hardware and Components', 3, 'pcs', 'Working', ''),
('km100-027', 'room-ccs', 'Coupler', 'Cables and Connectors', 32, 'pcs', 'Working', ''),
('km100-028', 'room-ccs', 'Crimping Tools Non-Pass through', 'Tools', 18, 'pcs', 'Working', ''),
('km100-029', 'room-ccs', 'Crimping Tools Non-Pass through', 'Tools', 10, 'pcs', 'Working', ''),
('km100-030', 'room-ccs', 'CSS Books', 'Peripherals and Storage', 6, 'pcs', 'Working', ''),
('km100-031', 'room-ccs', 'Cutter', 'Tools', 1, 'pcs', 'Working', ''),
('km100-032', 'room-ccs', 'Digital Multimeter', 'Diagnostic and Testing', 5, 'pcs', 'Working', ''),
('km100-033', 'room-ccs', 'Digital Multimeter Standard', 'Diagnostic and Testing', 5, 'pcs', 'Working', ''),
('km100-034', 'room-ccs', 'Dito Home', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-035', 'room-ccs', 'Double A Battery', 'Consumables and Maintenance', 18, 'pcs', 'Working', ''),
('km100-036', 'room-ccs', 'Drill Bit x13', 'Tools', 2, 'case', 'Working', ''),
('km100-037', 'room-ccs', 'Dual Modular Box', 'Cables and Connectors', 7, 'pcs', 'Working', ''),
('km100-038', 'room-ccs', 'DVDR 16X', 'Consumables and Maintenance', 73, 'pcs', 'Working', ''),
('km100-039', 'room-ccs', 'Electrical Contact Cleaner', 'Consumables and Maintenance', 4, 'pcs', 'Working', ''),
('km100-040', 'room-ccs', 'EPSON Printer L121', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-041', 'room-ccs', 'Ethernal Wall Plate', 'Networking Equipment', 12, 'pcs', 'Working', ''),
('km100-042', 'room-ccs', 'Exernal Optical Drive', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-043', 'room-ccs', 'Filler Clead-free', 'Consumables and Maintenance', 5, 'pcs', 'Working', ''),
('km100-044', 'room-ccs', 'Flat Head Screwdriver', 'Tools', 4, 'pcs', 'Working', ''),
('km100-045', 'room-ccs', 'Globe at Home', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-046', 'room-ccs', 'Half used Contact Cleaner 450ml', 'Consumables and Maintenance', 1, 'pcs', 'Used', ''),
('km100-047', 'room-ccs', 'HDD 500GB', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-048', 'room-ccs', 'HDMI to Display Port', 'Cables and Connectors', 10, 'pcs', 'Working', ''),
('km100-049', 'room-ccs', 'Heatsink Compound', 'Consumables and Maintenance', 2, 'pcs', 'Working', ''),
('km100-050', 'room-ccs', 'Helping Hand Magnifier LED light with Soldering Stand', 'Tools', 3, 'pcs', 'Working', ''),
('km100-051', 'room-ccs', 'HP 800G1 Charger', 'Cables and Connectors', 7, 'pcs', 'Working', ''),
('km100-052', 'room-ccs', 'HP EliteDesk 800 GI USDI - System Unit', 'PC Hardware and Components', 1, 'pcs', 'Deffective', ''),
('km100-053', 'room-ccs', 'INPLAY X10 Case', 'PC Hardware and Components', 4, 'pcs', 'Working', ''),
('km100-054', 'room-ccs', 'INPLAY X50 Case', 'PC Hardware and Components', 1, 'pcs', 'Working', ''),
('km100-055', 'room-ccs', 'JUHER SSD', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-056', 'room-ccs', 'K2 Web Cam', 'Peripherals and Storage', 2, 'pcs', 'Working', ''),
('km100-057', 'room-ccs', 'Lan Tester', 'Diagnostic and Testing', 43, 'pcs', 'Deffective', ''),
('km100-058', 'room-ccs', 'Long Nose Pliers', 'Tools', 19, 'pcs', 'Working', ''),
('km100-059', 'room-ccs', 'Magnetic Mat', 'Consumables and Maintenance', 7, 'pcs', 'Working', ''),
('km100-060', 'room-ccs', 'MERCUSYS Router', 'Networking Equipment', 10, 'pcs', 'Working', ''),
('km100-061', 'room-ccs', 'Multi-function Induction Headlamp', 'Tools', 9, 'pcs', 'Working', ''),
('km100-062', 'room-ccs', 'NAS USB', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-063', 'room-ccs', 'Network Attached Storage', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-064', 'room-ccs', 'Network Controller', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-065', 'room-ccs', 'NPC Monitor', 'PC Hardware and Components', 2, 'pcs', 'Working', ''),
('km100-066', 'room-ccs', 'NPC Monitor', 'PC Hardware and Components', 2, 'pcs', 'Used', ''),
('km100-067', 'room-ccs', 'PCI&PCI Express Card', 'PC Hardware and Components', 10, 'pcs', 'Working', ''),
('km100-068', 'room-ccs', 'Portable Electric Drill', 'Tools', 2, 'box', 'Working', ''),
('km100-069', 'room-ccs', 'Procurve Switch', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-070', 'room-ccs', 'Punch Down', 'Tools', 17, 'pcs', 'Working', ''),
('km100-071', 'room-ccs', 'RAMSTA Motherboard', 'PC Hardware and Components', 5, 'pcs', 'Working', ''),
('km100-072', 'room-ccs', 'Rework Station', 'Tools', 3, 'pcs', 'Working', ''),
('km100-073', 'room-ccs', 'RJ45 Connector Cups Blue', 'Cables and Connectors', 176, 'pcs', 'Working', ''),
('km100-074', 'room-ccs', 'RJ45 Network Connector', 'Cables and Connectors', 280, 'pcs', 'Working', ''),
('km100-075', 'room-ccs', 'RJ45 Network Connector', 'Cables and Connectors', 397, 'pcs', 'Deffective', ''),
('km100-076', 'room-ccs', 'RJ45 Network Connector Pass-through', 'Cables and Connectors', 46, 'pcs', 'Working', ''),
('km100-077', 'room-ccs', 'SAMWA Multimeter', 'Diagnostic and Testing', 10, 'pcs', 'Working', ''),
('km100-078', 'room-ccs', 'Screwdriver', 'Tools', 16, 'pcs', 'Working', ''),
('km100-079', 'room-ccs', 'Screws', 'Consumables and Maintenance', 32, 'pcs', 'Working', ''),
('km100-080', 'room-ccs', 'Single Modular Box', 'Cables and Connectors', 2, 'pcs', 'Working', ''),
('km100-081', 'room-ccs', 'Solder Sucker', 'Tools', 15, 'pcs', 'Working', ''),
('km100-082', 'room-ccs', 'Solder Wire', 'Consumables and Maintenance', 2, 'pcs', 'Working', ''),
('km100-083', 'room-ccs', 'Soldering Kit', 'Tools', 11, 'bag', 'Working', ''),
('km100-084', 'room-ccs', 'Steel Tape', 'Consumables and Maintenance', 9, 'pcs', 'Working', ''),
('km100-085', 'room-ccs', 'Switch Catalyst 2960G', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-086', 'room-ccs', 'Switch Catalyst 3560G', 'Networking Equipment', 2, 'pcs', 'Working', ''),
('km100-087', 'room-ccs', 'System Unit Wire', 'Cables and Connectors', 28, 'pcs', 'Working', ''),
('km100-088', 'room-ccs', 'TENDA Router', 'Networking Equipment', 6, 'pcs', 'Working', ''),
('km100-089', 'room-ccs', 'TENDA Router', 'Networking Equipment', 1, 'pcs', 'Used', ''),
('km100-090', 'room-ccs', 'TENDA Router', 'Networking Equipment', 1, 'pcs', 'Used', ''),
('km100-091', 'room-ccs', 'TENDA Router', 'Networking Equipment', 1, 'pcs', 'Used', ''),
('km100-092', 'room-ccs', 'TENDA Tilt Camera', 'Peripherals and Storage', 1, 'pcs', 'Used', ''),
('km100-093', 'room-ccs', 'TENDA Tilt Camera', 'Peripherals and Storage', 1, 'pcs', 'Used', ''),
('km100-094', 'room-ccs', 'TP-Link Router Archer C64', 'Networking Equipment', 10, 'pcs', 'Empty', ''),
('km100-095', 'room-ccs', 'Unidentified Motherboard', 'PC Hardware and Components', 2, 'pcs', 'Deffective', ''),
('km100-096', 'room-ccs', 'Unidentified System Unit Case', 'PC Hardware and Components', 2, 'pcs', 'Working', ''),
('km100-097', 'room-ccs', 'UPS', 'PC Hardware and Components', 10, 'pcs', 'Working', ''),
('km100-098', 'room-ccs', 'USB External HDD All-in-one External Inclosure Storage', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-099', 'room-ccs', 'USB External HDD, 3.5 Enclosure', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-100', 'room-ccs', 'USB to RJ45', 'Cables and Connectors', 1, 'pcs', 'Working', ''),
('km100-101', 'room-ccs', 'USB TO RS232', 'Cables and Connectors', 2, 'pcs', 'Working', ''),
('km100-102', 'room-ccs', 'VGA to Display Port', 'Cables and Connectors', 3, 'pcs', 'Working', ''),
('km100-103', 'room-ccs', 'VGA Wire', 'Cables and Connectors', 1, 'pcs', 'Working', ''),
('km100-104', 'room-ccs', 'Video Card', 'PC Hardware and Components', 2, 'pcs', 'Working', ''),
('km100-105', 'room-ccs', 'Web Cam', 'Peripherals and Storage', 6, 'pcs', 'Working', ''),
('km100-106', 'room-ccs', 'Windows 10 Pro', 'Operating System and Software', 10, 'pcs', 'Working', ''),
('km100-107', 'room-ccs', 'Windows Server 2022', 'Operating System and Software', 1, 'pcs', 'Working', ''),
('km100-108', 'room-ccs', 'Wire Stripper', 'Tools', 19, 'pcs', 'Working', ''),
('km100-109', 'room-ccs', 'Wireless Landline', 'Peripherals and Storage', 1, 'pcs', 'Working', ''),
('km100-110', 'room-ccs', 'Wireless N Ceiling Mount Access Point', 'Networking Equipment', 1, 'pcs', 'Working', ''),
('km100-111', 'room-ccs', 'Wireless N Ceiling Mount Access Point', 'Networking Equipment', 10, 'pcs', 'Incomplete', ''),
('km100-112', 'room-ccs', 'YALE Smoke Detector', 'Peripherals and Storage', 1, 'pcs', 'Working', '')
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity, condition = EXCLUDED.condition;

```

---

