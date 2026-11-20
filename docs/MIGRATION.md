# Migration Map: `index.html` → `src/`

Working plan for moving the deployed single-file app onto the modular React/TypeScript
codebase. Line references point at the current `index.html`; targets are the `src/` files.

Status legend: **done** · **todo** · **decision needed**

---

## Phase 0 — Unblock the build

**Finding:** `npm run build` currently succeeds but does **not** build `src/`.

Vite treats the root `index.html` as its entry. That file is the hand-written standalone
app — it has no `<script type="module" src="/src/main.tsx">` — so Vite copies it and its
`public/` scripts and emits `dist/index.html` (253 kB, 3 modules transformed). The React
codebase is never bundled.

Verified by an esbuild smoke bundle of `src/main.tsx` (2.7 MB, resolves React, xlsx and
`@supabase/supabase-js`), so `src/` itself is sound — it just has no entry point.

| Option | Change | Trade-off |
|---|---|---|
| **A (recommended)** | Rename standalone to `standalone.html`; make `index.html` the Vite shell loading `/src/main.tsx` | Clean split; needs a deploy-config change and a redirect for anyone with the old URL bookmarked |
| B | Keep `index.html`; add `app.html` as an extra `rollupOptions.input` | No deploy change; two HTML entries to maintain |
| C | Split `src/` into its own repo | Cleanest long term; loses the single-repo history |

Also done in Phase 0: `await` inside the non-async `onSave` arrow in `src/App.tsx` (the
only hard compile error), `vitest`/`jsdom`/`@supabase/supabase-js` added to `package.json`,
`npm test` script added. `tsc --noEmit` is clean and 11/11 tests pass.

---

## Phase 1 — Feature parity

Everything below exists in `index.html` and is missing from `src/`. Port in this order;
each row is independently shippable.

| # | Feature | Source in `index.html` | Target |
|---|---|---|---|
| 1 | Pagination (25/page) | 1811–1814, 2176–2178, 4064–4076 | `App.tsx` state + `InventoryTable` footer |
| 2 | Row checkboxes + select-all-page | 1807, 2216–2242, 3869–3936 | `InventoryTable`, new `BulkActionBar` |
| 3 | Bulk move / set status / delete | 2327–2395, 4091–4150 | `BulkActionBar` + `App.tsx` handlers |
| 4 | Column show/hide + dropdown | 1774–1780, 2244–2255, 3782–3824 | `Header`, own storage key |
| 5 | "Needs Attention" filter | 1797, 2123–2128, 3739–3748 | `App.tsx` filter + toolbar |
| 6 | Import preview modal, 3 modes | 2563–2612, 4152–4276 | new `ImportPreviewModal` |
| 7 | Auto-create rooms from sheet names | 2581–2596 | import handler |
| 8 | Drag-and-drop import | 2061–2097, 4278–4289 | `App.tsx` window listeners |
| 9 | ExcelJS styled export | 2617–3131 | replace `utils/excelExport.ts` (needs `exceljs` dep) |
| 10 | CSV export (UTF-8 BOM) | 3134–3199 | `utils/` |
| 11 | Printable audit report + signatures | 103–117, 3353–3418 | new `PrintReport` component |
| 12 | Asset tag sticker | 4291–4350 | new `AssetTagModal` |
| 13 | Keyboard shortcuts (`/`, `Ctrl+K`, `Alt+N`, `Esc`) | 2019–2059 | `App.tsx` effect |
| 14 | Mobile drawer + room pill bar | 3423–3483, 3559–3574 | `Sidebar`, new `MobileNav` |
| 15 | Supabase status drawer | 4402–4479 | `Header` settings panel |

---

## Phase 2 — Data layer

These are behaviour differences, not missing UI. Each one silently corrupts or splits data.

| Issue | Where | Fix |
|---|---|---|
| `custom_fields` dropped on write | `App.tsx:110` writes `{}` | Serialize non-system keys like `index.html:1874–1890` |
| Two local databases | `_v1` keys in `src`, `_v2` in `index.html` | One-time migration reader: copy `_v2` → `_v1` if `_v1` is empty, then retire `_v2` |
| Deleting a room orphans items | `src` deletes items then room; `index.html` only the room (`ON DELETE SET NULL`) | Delete items explicitly, or rely on FK and filter out `room_id IS NULL` rows |
| Supabase errors are invisible | `try/catch` around calls that return `{ error }` | Wrapper that checks `error` and toasts |
| Three ID schemes | `km100-001`, `item-<ts>`, `km100-<ts>` | Single generator, keep `km100-` prefix |
| `Deffective` reaches the UI | 5 seed rows, `seed.sql:29`, `defaultData.ts` | Normalize on ingest (`index.html:2487–2499` already does) and migrate existing rows |
| Import falls back to a hardcoded room | `App.tsx:608` `'room-ccs'` | Fail loudly, or create the room |
| Bulk ops never reach the cloud | `bulkDeleteItemsFromSupabase` is defined and never called | Wire bulk handlers to the sync helpers |
| `handleSetQuantity` skips sync | `index.html:2275–2285` | Sync like the ± buttons do |

---

## Phase 3 — Cutover

1. Export a JSON backup from the live app (Settings → Export JSON Backup) and archive it.
2. Review RLS before cutover. All three tables are `USING (true)` for read **and** write,
   and the publishable key ships in the bundle — anyone can wipe the database today.
3. Point `vercel.json` at the build output (`outputDirectory: "dist"`, real `buildCommand`),
   keep the SPA rewrite, and leave the standalone build reachable for one release cycle.
4. Verify with the 112-item seed: 4 rooms populated, 8 empty, statuses 97/7/5/2/1.

---

## Invariants worth not breaking

- **localStorage holds live user data.** Never change a key without a reader for the old one.
- **Excel column order follows the schema**, with a room column appended if the schema has none.
- **Excel output is the institutional artifact** — headers, logo, tab colours and the
  `=SUM()` total are expected by whoever audits the property register.
- **`status` and `condition` are the same value** in two fields. Any new write path must set both.
