# KM100 Inventory Management System
> **Official Asset & Property Register for KM100 Skills and Training Center, Inc.**

---

## 🗂️ Project Architecture & Directory Structure

The repository is cleanly partitioned into dedicated **Frontend** and **Backend** directories:

```
KM100 Stock/
├── 🌐 backend/                      # Cloud database definitions, schemas & configs
│   ├── database/
│   │   ├── schema.sql             # Complete PostgreSQL schema (tables, RLS, indexes)
│   │   └── seed.sql               # Institutional seed / initial dataset
│   ├── .env                       # Backend Supabase environment config (git-ignored)
│   ├── .env.example               # Backend template config
│   └── README.md                  # Supabase deployment & database instructions
│
├── 🎨 frontend/                     # Dedicated React + TypeScript web application
│   ├── public/                    # Portable offline vendor bundles & branding assets
│   │   ├── standalone/            # Standalone offline bundles
│   │   ├── favicon.ico
│   │   ├── favicon.png
│   │   ├── logo.png               # KM100 institutional seal
│   │   └── robots.txt
│   ├── src/                       # Modular TypeScript source code
│   │   ├── components/            # UI components (Header, Table, Modals, Badges)
│   │   ├── data/                  # Official institutional default datasets
│   │   ├── services/              # Supabase API services
│   │   ├── types/                 # TypeScript data contracts & ambient types
│   │   └── utils/                 # Excel export, CSV parser & auth utilities
│   ├── .env                       # Frontend environment config (git-ignored)
│   ├── .env.example               # Frontend environment template
│   ├── index.html                 # Single page web application entry
│   ├── package.json               # Frontend dependencies & scripts
│   ├── postcss.config.js          # PostCSS configuration
│   ├── tailwind.config.js         # Tailwind CSS styling & brand themes
│   ├── tsconfig.json              # TypeScript configuration
│   ├── vite.config.ts             # Vite bundler configuration
│   ├── vitest.config.ts           # Vitest test runner configuration
│   └── README.md                  # Frontend documentation
│
├── 📊 data/                         # Official spreadsheets and reference data
│   └── official-spreadsheets/
│       ├── KM100_Official_Inventory.xlsx # Master Excel file
│       └── KM100_Official_Inventory.csv  # Master CSV export
│
├── 📖 docs/                         # Project specifications & design architecture
│   ├── DESIGN.md                  # UI/UX design standards & principles
│   └── PRODUCT.md                 # Product requirements & feature roadmap
│
├── package.json                   # Root package with workspace scripts
├── run-dev.cmd                    # Double-click Windows launcher for development
├── setup.bat                      # Windows one-click dependency installer & runner
└── start-dev.ps1                  # PowerShell development script
```

---

## 🚀 Getting Started

### 1. Run Development Server
You can start the frontend development server from the root directory or inside `frontend/`:

**From Root Directory:**
```bash
npm run dev
```
or double-click `run-dev.cmd` (or `setup.bat` for initial setup).

**From `frontend/` Directory:**
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:3000`.

### 2. Run Test Suite
```bash
npm test
```
or from `frontend/`:
```bash
cd frontend
npm test
```

### 3. Production Build
```bash
npm run build
```
Build output is generated into `frontend/dist/`.

---

## ☁️ Cloud Database (Backend)
The backend uses **Supabase PostgreSQL** with Realtime WebSockets:
- See [`backend/README.md`](file:///c:/Users/KM100%20-%201008/Downloads/KM100%20Stock/backend/README.md) for full instructions on applying schemas (`backend/database/schema.sql`) and managing database migrations.
