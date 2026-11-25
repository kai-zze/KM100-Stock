# KM100 Inventory Management System

> **Official Property Custody & Asset Register for KM100 Skills and Training Center, Inc.**  
> A high-density, local-first, cloud-synchronized inventory management platform engineered for institutional workshops, training facilities, and accredited vocational labs.

---

## 🏛️ System Overview

The **KM100 Inventory Management System** streamlines property custody, equipment tracking, and compliance audits across vocational training programs (Computer Systems Servicing, Bread & Pastry, Welding, Electrical Installation, etc.).

- **Local-First & Cloud-Synchronized**: Boots instantly from `localStorage` (0 ms paint) and asynchronously reconciles with **Supabase PostgreSQL** in the background (<200 ms).
- **Institutional Passkey Governance**: Strict role-based registration requiring authorized institutional passkeys for Administrators and Instructors.
- **High-Density Auditing**: Instant `+` and `−` quantity steppers, live search-as-you-type, one-click KPI filters, and bulk inventory actions.
- **Physical Sign-Off & Excel Reports**: Generates formal print-ready custody audit sheets with verified 3-signature sign-off blocks and multi-sheet styled Excel workbooks.
- **Always-On Cloud**: Automated GitHub Actions scheduled ping prevents Supabase Free Tier inactivity pausing.

---

## 🗂️ Project Directory Structure

```
KM100-Stock/
├── .github/
│   └── workflows/
│       └── keep-alive.yml             # Scheduled cron to keep Supabase cloud active
│
├── backend/                           # Cloud database definitions & configurations
│   ├── database/
│   │   ├── schema.sql                 # PostgreSQL tables, RLS policies, triggers, indexes
│   │   └── seed.sql                   # Official institutional baseline seed dataset
│   └── README.md                      # Database architecture & deployment instructions
│
├── data/                              # Master reference spreadsheets
│   └── official-spreadsheets/
│       ├── KM100_Official_Inventory.xlsx # Master baseline Excel workbook
│       └── KM100_Official_Inventory.csv  # Master baseline CSV export
│
├── docs/                              # Architecture blueprints & operational guides
│   ├── APP_FLOWCHART.md               # Visual Mermaid flowcharts (Light Mode)
│   ├── DESIGN.md                      # UI/UX craftsmanship & anti-slop guidelines
│   ├── MIGRATION.md                   # Cloud synchronization migration guide
│   └── PRODUCT.md                     # Institutional product requirements & roadmap
│
├── public/                            # Static assets & web manifest
│   ├── favicon.ico / favicon.svg      # Institutional circular seal favicons
│   ├── logo.png / logo-sm.png         # KM100 institutional brand logos
│   ├── tesda-logo.png                 # Official TESDA accreditation seal
│   ├── manifest.json                  # Web application manifest
│   └── standalone/                    # Offline standalone vendor bundle fallback
│
├── src/                               # Modular React + TypeScript application source
│   ├── components/                    # UI component library
│   │   ├── Header.tsx                 # Global actions toolbar, exports & profile
│   │   ├── Sidebar.tsx                # Desktop facilities navigation drawer
│   │   ├── MobileNav.tsx              # Slide-in mobile facilities drawer
│   │   ├── OverviewDashboard.tsx      # All-facilities summary cards & quick jump
│   │   ├── InventoryTable.tsx         # Data grid with inline quantity steppers
│   │   ├── ItemModal.tsx              # Equipment enrollment & editing modal
│   │   ├── RoomModal.tsx              # Facility workshop creation & rename modal
│   │   ├── ColumnsSchemaModal.tsx     # Custom column database schema customizer
│   │   ├── ColumnsVisibilityMenu.tsx  # Dynamic column visibility toggle dropdown
│   │   ├── BulkActionBar.tsx          # Multi-select batch actions & bulk delete
│   │   ├── AssetTagModal.tsx          # Printable barcode & asset tag generator
│   │   ├── ConditionBadge.tsx         # Semantic status tags (Working, Repair, Disposal)
│   │   ├── OnboardingModal.tsx        # 8-step interactive system walkthrough
│   │   ├── LoginScreen.tsx            # Institutional auth with passkey governance
│   │   ├── UserProfileModal.tsx       # Account settings & passkey manager
│   │   ├── PrintReport.tsx            # Physical custody audit sheet (window.print)
│   │   ├── SplashScreen.tsx           # Initial 3D institutional boot splash
│   │   ├── SplashAssembly3D.tsx       # Three.js 3D assembly animation
│   │   └── SkeletonLoader.tsx         # Enterprise loading placeholders
│   │
│   ├── data/
│   │   ├── defaultData.ts             # Initial equipment records & facility rooms
│   │   └── logoBase64.ts              # Inlined institutional seal for offline PDF/Excel
│   │
│   ├── services/
│   │   └── inventoryService.ts        # Supabase CRUD & real-time sync layer
│   │
│   ├── types/
│   │   ├── inventory.ts               # Core data models (Item, Room, User, Column)
│   │   └── ambient.d.ts               # Ambient global TypeScript definitions
│   │
│   ├── utils/
│   │   ├── auth.ts                    # Passkey verification, hashing, session management
│   │   ├── excelStyledExport.ts       # Multi-sheet styled Excel (.xlsx) workbook builder
│   │   ├── excelExport.ts             # Lightweight CSV/Excel export fallback
│   │   ├── csvImport.ts               # Spreadsheet import parser & validator
│   │   ├── importParse.ts             # Smart column mapping & discrepancy detection
│   │   ├── status.ts                  # Condition normalizers & stock health checks
│   │   ├── storage.ts                 # Local-first storage wrapper with versioning
│   │   ├── supabaseClient.ts          # Supabase client singleton & configuration
│   │   └── __tests__/                 # Vitest test suite (27 unit tests)
│   │       ├── auth.test.ts           # Authentication & passkey governance tests
│   │       ├── csvImport.test.ts      # Data ingestion & schema mapping tests
│   │       ├── excelExport.test.ts    # Single-sheet export tests
│   │       └── excelStyledExport.test.ts # Multi-sheet Excel workbook tests
│   │
│   ├── App.tsx                        # Master application state & view coordinator
│   ├── main.tsx                       # React DOM entry point
│   └── index.css                      # Tailwind CSS v3 directives & custom fonts
│
├── setup.bat                          # One-click Windows setup & launcher script
├── tailwind.config.js                 # Institutional palette & typography tokens
├── tsconfig.json                      # Strict TypeScript compiler options
├── vite.config.ts                     # Vite build & bundle configuration
└── vitest.config.ts                   # Vitest unit test configuration
```

---

## 🔐 Institutional Passkeys & Access Roles

Registration is strictly protected to prevent unauthorized public account creation. The application supports two institutional roles:

| Role                            | Default Passkey    | Alternate / Legacy | Permissions                                                                                                                                |
| :------------------------------ | :----------------- | :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **Property Custodian (Admin)**  | `KM100-ADMIN-2026` | `KM100-ADMIN-2025` | Full administrative control: schema configuration, room creation/deletion, passkey updates, equipment management, and multi-sheet exports. |
| **Training Instructor (Staff)** | `KM100-STAFF-2026` | `KM100-STAFF-2025` | Operational custody: inline stock counts (`+` / `−`), condition tagging, physical audits, asset tag printing, and individual room reports. |

> Passkeys are case-insensitive and can be entered with or without hyphens (`km100admin2026`). Authorized Custodians can update passkeys anytime in **User Profile** → **Manage Passkeys**.

---

## ⚡ Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher

### Installation & Development

```bash
# 1. Clone repository
git clone https://github.com/kai-zze/KM100-Stock.git
cd KM100-Stock

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🧪 Testing & Verification

The codebase maintains strict quality, accessibility, and type-safety standards:

```bash
# Run Vitest Unit Test Suite (27 unit tests)
npm test -- --run

# TypeScript Strict Typecheck & Vite Production Build
npm run build

# Prettier Code Formatting
npm run format
```

---

## ☁️ Cloud Persistence & Keep-Alive Automation

- **Supabase Backend**: Hosted on PostgreSQL 15+ (`https://kpzancwkmbhnuqbnqrii.supabase.co`).
- **Real-Time Engine**: PostgreSQL changes (`inventory_items`) stream to connected client devices in real time.
- **Keep-Alive Scheduled Ping**: `.github/workflows/keep-alive.yml` automatically executes a lightweight REST check every 3 days at 00:00 UTC to ensure Supabase's free-tier database never pauses due to inactivity.

---

## 📊 Visual Flowcharts & Documentation

Detailed system architecture, authentication flow, and operational lifecycle diagrams are documented in:

👉 **[docs/APP_FLOWCHART.md](docs/APP_FLOWCHART.md)** _(Configured with high-contrast light mode diagrams)_
