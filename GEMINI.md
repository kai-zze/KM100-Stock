# KM100 Inventory System: Agent Guidelines & Engineering Standards

This document establishes the architecture, design principles, security policies, and engineering workflows for the **KM100 Skills and Training Center, Inc.** Property Custody & Inventory Management System.

---

## 1. Mandatory Craftsmanship & Design Standards

This project adheres strictly to **UI/UX Pro Max** and **Impeccable** craftsmanship standards.

1. **Anti-Slop Imperative**:
   - **No Gratuitous Gradients**: Never use generic purple/magenta AI gradients, unstyled card borders, or neon glow halos.
   - **No Card Inception**: Avoid nesting cards within cards. Use 1px architectural borders (`border-slate-200 / border-slate-800`), spatial rhythm, and background contrast.
   - **Calibrated Status Badges**: All condition badges in `ConditionBadge.tsx` use semantic tokens (Emerald for Working/Good, Amber for Used/Fair, Rose for Defective/Needs Repair, Slate for Empty) with solid status dots (never `animate-ping`).
   - **High Contrast**: All text must pass WCAG AA contrast ($\ge 4.5:1$). The institutional brand color is `text-amber-700` (`#b45309`) or `#c2410c`, ensuring high visibility against light backgrounds.

2. **Operate Mode Excellence (High-Density Management)**:
   - Data is the hero. Provide immediate direct manipulation: inline `+` and `−` quantity steppers, direct numeric editing (`inputMode="numeric"`, `tabular-nums`), search-as-you-type, and instant room filter pills.
   - Keep table headers sticky (`sticky top-0 bg-slate-50/95 backdrop-blur z-10`).
   - Destructive operations (room deletion, item deletion) must always require an explicit confirmation modal with red accents.

3. **Institutional Typography**:
   - Headings: **Plus Jakarta Sans** (`font-heading font-extrabold tracking-tight`).
   - Body & Controls: **DM Sans** (`font-sans font-medium`).
   - Numbers, Metrics, & Timestamps: Always use `tabular-nums font-mono` to prevent layout shifts.

4. **Responsive Ergonomics**:
   - **Mobile (<640px)**: Uses the slide-in `MobileNav` drawer, single-column dashboard cards, and a horizontally pannable table with swipe guidance.
   - **Desktop (>1024px)**: Expandable facilities sidebar and fluid multi-column grid (`2xl:grid-cols-5`).

---

## 2. Cloud Architecture & Data Persistence

The application employs a **Local-First, Cloud-Synchronized Architecture**:

1. **Supabase Cloud Backend (Source of Truth)**:
   - **Project URL**: `https://kpzancwkmbhnuqbnqrii.supabase.co`
   - **Database Tables**:
     - `public.rooms`: Facility training rooms and suites.
     - `public.inventory_items`: All equipment items, quantities, conditions, units, and custom JSONB fields.
     - `public.columns_schema`: Dynamic customizable column definitions (text, number, dropdown).
     - `public.profiles`: Institutional user profiles linked via Foreign Key to `auth.users(id)`.
   - **Authentication**: Supabase Auth with **Confirm email set to OFF** (to prevent free-tier SMTP rate limiting).
   - **Auto-Sync Trigger**: `on_auth_user_created` trigger on `auth.users` automatically populates new registrations into `public.profiles`.
   - **Real-time WebSockets**: Listens for PostgreSQL changes on `inventory_items` to stream updates across all connected devices.

2. **Offline Resilience (`localStorage`)**:
   - The app reads from `localStorage` immediately on boot (0 ms) for instant paint without layout shifts.
   - Background fetch asynchronously reconciles with Supabase within ~100–200 ms.
   - In-flight promise caching prevents duplicate API requests during component mounts.

---

## 3. Institutional Passkey Governance

Access control enforces role-based permissions via official passkeys:

- **Property Custodian (Admin)**: Authorized via Admin Passkey (default: `KM100-ADMIN-2025`). Admins have schema control, room management, and passkey configuration rights.
- **Training Instructor (Staff)**: Authorized via Staff Passkey (default: `KM100-STAFF-2025`). Staff can update item quantities, change conditions, and conduct physical audits.
- **Passkey Modification**: Admins can update institutional passkeys via the Profile Management modal, saving to `localStorage` (`km100_custom_passkeys_v1`).

---

## 4. Document Generation & Export Standards

1. **Formal Physical Inventory Sheet (`PrintReport.tsx`)**:
   - Triggered via `window.print()`.
   - Hidden on screen via `.print-only`, revealed in `@media print`.
   - Displays the official circular logo, letterhead `KM100 SKILLS AND TRAINING CENTER, INC.`, audit date, document reference number, facility scope, item count, and 3-column sign-off blocks (Prepared By, Audited By, Approved By).
   - Screen navigation headers are hidden in print using `header.no-print`.

2. **Multi-Sheet Excel Export (`excelStyledExport.ts`)**:
   - Generates `.xlsx` workbooks containing a master summary sheet plus dedicated sheets for every facility room.
   - Preserves institutional styling, column widths, and cell borders.

---

## 5. Verification & Testing Requirements

Before concluding any development task or pushing changes, you must always run and pass:

```bash
# 1. Vitest Unit Test Suite (All 26 tests must pass)
npm test -- --run

# 2. TypeScript Strict Typecheck & Vite Production Build
npm run build

# 3. Prettier Formatting
npm run format
```
