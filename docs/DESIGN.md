# Design System & Tokens: KM100 Inventory Management System

## Design Mode: OPERATE (High-Craft Institutional Dashboard)

### Color Tokens

- **Brand Primary**:
  - Blue 600 `#2563eb` (Interactive brand primary)
  - Blue 700 `#1d4ed8` (Hover / focus active)
  - Blue 50 `#eff6ff` (Subtle selection highlight in light mode)
  - Blue 950/40 (Selection highlight in dark mode)
- **Status & Condition Semantic Tokens**:
  - **Good**: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60`)
  - **Fair**: Amber (`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60`)
  - **Needs Repair**: Orange (`bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60`)
  - **Condemned**: Red / Rose (`bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60`)
- **Neutral Scales**:
  - Light mode background: `#f8fafc` (Slate 50), card surface: `#ffffff`, borders: `#e2e8f0` (Slate 200)
  - Dark mode background: `#0b0f19` (Deep slate night), card surface: `#131b2e` (Dark navy slate), elevated: `#1e293b`, borders: `#1e293b` / `#334155`
  - Text: Slate 900 `#0f172a` (light primary), Slate 500 `#64748b` (light secondary), Slate 100 `#f1f5f9` (dark primary), Slate 400 `#94a3b8` (dark secondary).

### Typography

- **Headings**: Inter / System Sans, `font-bold tracking-tight`
- **Body**: System Sans, `text-sm leading-relaxed`
- **Data & Numeric**: `font-mono tabular-nums` for quantities, counts, and dates

### Spatial Hierarchy & Layout

- Top institution header with institution branding, live item & room counters, search/filter controls, and theme switch.
- Split-screen or collapsible sidebar for room navigation with item count badges and "All Rooms" master dashboard.
- Main area with sticky table header, inline quantity +/- controls, column customization trigger, export triggers, and smooth modal overlays.
- Responsive design for mobile screens down to 360px up to 4K ultra-wide monitors.
