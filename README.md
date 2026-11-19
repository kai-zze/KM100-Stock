# KM100 Inventory Management System
**KM100 Skills and Training Center, Inc.**

A modern, responsive, high-craft web-based Inventory Management System built with **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **SheetJS (`xlsx`)**. Designed specifically for technical-vocational training institutes, computer laboratories, workshops, and administrative facilities.

---

## 🎨 Design Intelligence Installed

This repository is powered by **UI/UX Pro Max** and **Impeccable** craftsmanship standards:
- **UI/UX Pro Max (`.agents/skills/ui-ux-pro-max/`)**: Systematic token hierarchies, high-information density for operational workflows, purposeful enterprise color palettes, and strict spatial scales.
- **Impeccable (`.agents/skills/impeccable/`)**: Anti-slop engineering avoiding generic AI aesthetics (no unmotivated purple gradients, no card-in-card inception, no uncalibrated status pills). High-contrast WCAG AA accessible layouts with sticky headers, tactile button depressions, and direct inline manipulation.
- Context documents: `PRODUCT.md`, `DESIGN.md`, and workspace rules in `GEMINI.md`.

---

## 🚀 Key Features

### 1. Training Room & Facility Management
- **Sidebar Navigation**: Dedicated rooms list (Computer Lab 1, Training Room A, Admin Office, Storage Room).
- **Live Counter Badges**: Instant item count badges next to each facility.
- **"All Rooms" Master Dashboard**: High-level institutional metrics:
  - Total Rooms & Unique SKUs
  - Total Physical Units Tracked
  - Facility Health & Condition Ratio
  - Interactive Room Breakdown Cards with quick drill-down.
- **CRUD Operations**: Create, rename, and delete rooms with safeguards and confirmation dialogs.

### 2. Customizable Columns (Schema Builder)
- Open the **"Customize Columns"** modal to adapt the inventory schema dynamically.
- **Column Types**: Text, Number, and Dropdown (with custom options list).
- **Full Schema Control**: Add custom columns (e.g. Serial Number, Asset Tag, Supplier, Calibration Date), rename columns, reorder columns (Move Up/Down), or remove columns.
- **Dynamic Propagation**: Column changes immediately update:
  1. The responsive data table
  2. The Add/Edit Item modal forms
  3. The SheetJS Excel export worksheets!

### 3. Rapid Item Management (CRUD & Inline Steppers)
- **Direct +/- Quick Steppers**: Increase or decrease quantities inline with zero modal friction.
- **Real-Time Global Search**: Instant filter across item names, categories, remarks, and custom schema fields.
- **Multi-Level Filters**: Filter by Category and Condition simultaneously.
- **Column Sorting**: Click any header to sort ascending or descending.

### 4. Institutional Excel Export (SheetJS / xlsx)
- Download real Microsoft Excel `.xlsx` files:
  - **Multi-Sheet Workbook**: Generates a consolidated **"Summary"** sheet followed by dedicated individual tabs per room.
  - **Current Room Only**: Exports the active room or filtered view.
- **Institutional Header Block**: Official 4-row header with institution name, room title, and timestamped export date (`KM100_Inventory_YYYY-MM-DD.xlsx`).

### 5. Data Persistence & Portability
- **Auto-Save**: All changes auto-persist to browser `localStorage`.
- **JSON Backup & Restore**: One-click export to download a portable backup file, and import to restore across devices or browsers.
- **Sample Data Management**: Pre-populated with realistic training center inventory (workstations, networking switches, projectors, multimeters, etc.) with a "Reset Sample Data" or "Clear All Data" option.

### 6. Light / Dark Mode & Responsive Layout
- Seamless theme toggle with persistent state and system preference detection.
- Sticky table headers with backdrop blur.
- High-contrast semantic condition tags: Good (Emerald), Fair (Amber), Needs Repair (Orange), Condemned (Rose).

---

## 🖥️ How to Run

### Method 1: Instant Launch (Zero Setup / Offline)
Double-click or open **`index.html`** directly in any web browser (Chrome, Edge, Firefox, Safari). It is fully self-contained and ready to use immediately!

### Method 2: Modern Vite Dev Server (Optional)
If you have Node.js installed:
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build production bundle
npm run build
```
