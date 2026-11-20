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
